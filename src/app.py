import json
import logging
import os
from argparse import ArgumentError

import boto3
from lambda_request import LambdaRequest
from parameter_store_envar_loader import ParameterStoreEnvarLoader
from pdf_generator import PdfGenerator
from pokemontcg_io_api import PokemonTcgIoApi

logger = logging.getLogger()
logger.setLevel(logging.INFO)


def lambda_handler(event, context):
    """Sample pure Lambda function

    Parameters
    ----------
    event: dict, required
        API Gateway Lambda Proxy Input Format

        Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format

    context: object, required
        Lambda Context runtime methods and attributes

        Context doc: https://docs.aws.amazon.com/lambda/latest/dg/python-context-object.html

    Returns
    ------
    API Gateway Lambda Proxy Output Format: dict

        Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
    """
    try:
        logger.info("Processing event: %s", event)
        parameter_store_envar_loader = ParameterStoreEnvarLoader()
        parameter_store_envar_loader.load()

        lambda_request = LambdaRequest(event)

        if lambda_request.pokedex_number is None and lambda_request.generation is None and lambda_request.set_ids is None and lambda_request.series_ids is None:
            raise ArgumentError(event, f"Missing required parameters. Must provide pokedex_number, generation, set_ids, or series_ids. Received: {event}")

        # Get the card data from the API
        api = PokemonTcgIoApi()
        cards = api.get_cards(connection_id=lambda_request.connection_id, pokedex_number=lambda_request.pokedex_number, generation=lambda_request.generation, set_ids=lambda_request.set_ids, series_ids=lambda_request.series_ids)

        if lambda_request.only_first_printing:
            # Group cards by name, order by release_date, and select the oldest card for each name
            grouped_cards = {}
            for card in sorted(cards, key=lambda c: c.release_date):
                if card.name not in grouped_cards:
                    grouped_cards[card.name] = card
            cards = list(grouped_cards.values())

        if lambda_request.remove_lower_tier_holos:
            # Filter and keep the highest holofoil status card with the earliest release_date for each card name
            holofoil_priority = {"HOLOFOIL": 1, "REVERSE_HOLOFOIL": 2, "NORMAL_HOLO": 3}
            filtered_cards_by_name = {}
            for card in cards:
                if card.name not in filtered_cards_by_name:
                    filtered_cards_by_name[card.name] = card
                else:
                    existing_card = filtered_cards_by_name[card.name]
                    if (
                            holofoil_priority.get(card.holo, float('inf')) < holofoil_priority.get(existing_card.holo,
                                                                                                   float('inf'))
                            or (
                            card.holo == existing_card.holo
                            and card.release_date < existing_card.release_date
                    )
                    ):
                        filtered_cards_by_name[card.name] = card

            filtered_cards = list(filtered_cards_by_name.values())
            cards = filtered_cards

        # Use the specified ordering keys from lambda_request.ordering to sort the cards
        # If ordering keys are not valid attributes of Card, they should be ignored
        cards.sort(key=lambda card: tuple(getattr(card, key, None) or "" for key in lambda_request.ordering))

        # Write the data to a PDF in the S3 bucket
        filename = f"cards-{context.aws_request_id}.pdf"
        bucket_name = os.environ['S3_BUCKET_NAME']
        PdfGenerator.write_pdf_with_grid(cards, bucket_name, filename)

        # Use presigned URLs for fetching the file
        presigned_url = boto3.client('s3').generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket_name, "Key": filename},
            ExpiresIn=3600
        )

        # wss:// isn't supported by boto3
        apigateway = boto3.client('apigatewaymanagementapi', endpoint_url=os.environ['WEBSOCKET_ENDPOINT'].replace('wss://', 'https://'))
        try:
            apigateway.post_to_connection(
                ConnectionId=lambda_request.connection_id,
                Data=json.dumps({
                    'action': 'file_ready',
                    'fileUrl': presigned_url
                })
            )
        except apigateway.exceptions.GoneException:
            logger.info("Connection closed")

        return {
            "statusCode": 200,
            "download": presigned_url,
            "headers": {
                "Content-Type": "application/json"
            }
        }
    except Exception as e:
        logger.error("An error occurred: %s", str(e), exc_info=True)

        apigateway = boto3.client('apigatewaymanagementapi', endpoint_url=os.environ['WEBSOCKET_ENDPOINT'].replace('wss://', 'https://'))
        apigateway.post_to_connection(
            ConnectionId=event.get("connectionId", None),
            Data=json.dumps({
                'action': 'file_generation_error',
                'error': json.dumps({"error": str(e)})
            })
        )

        return {
            "statusCode": 500,
            "body": json.dumps({"error": str(e)}),
        }

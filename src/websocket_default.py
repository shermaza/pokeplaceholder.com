import os

import boto3
import json
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    logger.info("Received event: %s", json.dumps(event, indent=2))

    try:
        connection_id = event['requestContext']['connectionId']
        body = json.loads(event.get('body', '{}'))
        file_params = body.get('params', {})

        lambda_name = os.getenv('POKE_PLACEHOLDER_FUNCTION')
        lambda_client = boto3.client('lambda')
        lambda_client.invoke(
            FunctionName=lambda_name,
            InvocationType='Event',
            Payload=json.dumps({
                'connectionId': connection_id,
                'body': file_params
            })
        )

        return {
            'statusCode': 200,
            'body': 'File creation started'
        }
    except Exception as e:
        logger.error("An error occurred: %s", str(e), exc_info=True)
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }

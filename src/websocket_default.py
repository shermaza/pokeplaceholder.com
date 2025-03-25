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
        body_str = event.get('body', '{}')
        logger.info("Body before JSON parsing: %s", body_str)

        # Handle empty body
        if not body_str:
            return {
                'statusCode': 400,
                'body': json.dumps({'error': 'Empty body in request'})
            }

        # Preprocess to fix malformed JSON (convert single quotes to double quotes if necessary)
        try:
            # Attempt parsing the body directly
            body = json.loads(body_str)
        except json.JSONDecodeError as err:
            logger.warning("Malformed JSON detected. Attempting to sanitize input.")
            # Replace single quotes with double quotes
            sanitized_body_str = body_str.replace("'", '"')
            try:
                body = json.loads(sanitized_body_str)
            except json.JSONDecodeError as sanitizer_err:
                logger.error("Invalid JSON in request body after sanitization: %s", str(sanitizer_err))
                return {
                    'statusCode': 400,
                    'body': json.dumps({'error': f'Invalid JSON format: {str(sanitizer_err)}'})
                }

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

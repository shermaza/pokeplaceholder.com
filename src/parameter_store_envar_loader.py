import os

import boto3
import logging

logger = logging.getLogger()
logger.setLevel(logging.INFO)

class ParameterStoreEnvarLoader:
    def __init__(self):
        self.region_name = "us-west-2"  # Replace with your region
        self.client = boto3.client("ssm", region_name=self.region_name)
        self.parameters = {
            'POKEMONTCG_IO_API_KEY': '/pokeplaceholder/pokemontcgio-api-key'
        }

    def load(self):
        for envar_name, parameter_name in self.parameters.items():
            try:
                # Fetch the parameter value
                response = self.client.get_parameter(Name=parameter_name, WithDecryption=True)
                parameter_value = response['Parameter']['Value']

                # Store it in an environment variable
                os.environ[envar_name] = parameter_value
            except Exception as e:
                logger.error("An error occurred: %s", str(e), exc_info=True)
                raise
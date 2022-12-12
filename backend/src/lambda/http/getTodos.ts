import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { getTodosForUser as getTodosForUser } from '../../helpers/todos'
import { getUserId } from '../utils';
const logger = createLogger('Todos business logic')

// TODO: Get all TODO items for a current user
export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    // Write your code here
    const userId = getUserId(event)
    const indexName = event.queryStringParameters.indexName
    logger.info(indexName)
    const todos = await getTodosForUser(userId, indexName)
    
    return {
      statusCode: 200,
      body: JSON.stringify({
        items: todos
      })
    }
  }
);

handler.use(
  cors({
    credentials: true
  })
)
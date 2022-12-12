import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {
    constructor(
        private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly todoCreatedIndex = process.env.TODOS_CREATED_AT_INDEX
    ) { }
    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('Start getting all todos')

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: this.todoCreatedIndex,
            KeyConditionExpression: 'userId = :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }, (err) => {
            if (err) {
                logger.info('Failed to get todo items')
                throw new Error("Failed to get todo items")
            }
        }).promise()

        const items = result.Items
        return items as TodoItem[]
    }
    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('Start create new todo item')

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todoItem
        }, (err) => {
            if (err) {
                logger.info('Failed to create todo item')
                throw new Error("Failed to create todo item")
            }
        }).promise()

        return todoItem
    }
    async updateTodoItem(todoId: String, userId: String, updateTodoItem: TodoUpdate): Promise<TodoUpdate> {
        logger.info('Start update todo item')

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: "set #name = :name, dueDate = :dueDate, done = :done",
            ExpressionAttributeNames: {
                '#name': 'name',
            },
            ExpressionAttributeValues: {
                ":name": updateTodoItem.name,
                ":dueDate": updateTodoItem.dueDate,
                ":done": updateTodoItem.done
            }
        }, (err) => {
            if (err) {
                logger.info('Failed to update todo item')
                throw new Error("Failed to update todo item")
            }
        }).promise()

        return updateTodoItem
    }
    async deleteTodoItem(todoId: String, userId: String) {
        logger.info('Start delete todo item')

        await this.docClient.delete({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            }
        }, (err) => {
            if (err) {
                logger.info('Failed to delete todo item')
                throw new Error("Failed to delete todo item")
            }
        }).promise()
    }
    async updateAttachmentUrl(todoId: string, userId: string, attachmentUrl: string): Promise<string> {
        logger.info('Start update attachment url')

        await this.docClient.update({
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: "set attachmentUrl = :attachmentUrl",
            ExpressionAttributeValues: {
                ":attachmentUrl": attachmentUrl,
            }
        }).promise()

        return attachmentUrl
    }
}


import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from './attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const logger = createLogger('Todos business logic')
const attachment = new AttachmentUtils();
const todoAccess = new TodosAccess();

// TODO: Create
export async function createTodo(userId: string, createTodoRequest: CreateTodoRequest): Promise<TodoItem> {
    logger.info('Start todo create')
    const itemId = uuid.v4()
    const createdAt = new Date().toISOString()
    return await todoAccess.createTodoItem({
        todoId: itemId,
        userId: userId,
        name: createTodoRequest.name,
        dueDate: createTodoRequest.dueDate,
        createdAt: createdAt,
        attachmentUrl: null,
        done: false
    })
}
// TODO: Update
export async function updateTodo(todoId: string, userId: string, updateTodoRequest: UpdateTodoRequest): Promise<TodoUpdate> {
    logger.info('Start todo update')
    logger.info('done: ' + updateTodoRequest.done)
    return await todoAccess.updateTodoItem(todoId, userId, {
        name: updateTodoRequest.name,
        dueDate: updateTodoRequest.dueDate,
        done: updateTodoRequest.done
    })
}
// TODO: Delete
export async function deleteTodo(todoId: string, userId: string) {
    logger.info('Start todo delete')
    await todoAccess.deleteTodoItem(todoId, userId)
}
// TODO: Get
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info('Start get todo items')
    return todoAccess.getAllTodos(userId)
}
// TODO: Create attachment url
export async function createAttachmentPresignedUrl(todoId: string, userId: string): Promise<string> {
    logger.info('Start create attachment url')
    logger.info('userId: ' + userId)
    const url = attachment.getAttachmentUrl(todoId)
    await todoAccess.updateAttachmentUrl(todoId, userId, url)
    return attachment.getUploadUrl(todoId)
}
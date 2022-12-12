import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Input,
  Image,
  Loader,
  Form,
  Segment
} from 'semantic-ui-react'

import { createTodo, deleteTodo, getTodos, patchTodo , getUploadUrl, uploadFile} from '../api/todos-api'
import Auth from '../auth/Auth'
import { Todo } from '../types/Todo'

interface TodosProps {
  auth: Auth
  history: History
}

interface TodosState {
  todos: Todo[]
  newTodoName: string
  loadingTodos: boolean,
  expirationTime: number,
  file:any
}

export class Todos extends React.PureComponent<TodosProps, TodosState> {
  state: TodosState = {
    todos: [],
    newTodoName: '',
    loadingTodos: true,
    expirationTime: 1,
    file:undefined
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newTodoName: event.target.value })
  }
  handleExpireTimeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const re = /^[0-9\b]+$/;
    if ((event.target.value === '' || re.test(event.target.value)) && (!Number.isNaN(Number(event.target.value)) && 0 <= Number(event.target.value) && Number(event.target.value) < 31)) {
      this.setState({ expirationTime: Number(event.target.value)})
    }
  }
  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }
  onEditButtonClick = (todoId: string) => {
    this.props.history.push(`/todos/${todoId}/edit`)
  }

  onTodoCreate = async () => {
    try {
      if(this.state.newTodoName.length === 0) {
        alert('Todo creation failed. Please input name')
      }else if(this.state.newTodoName.length < 3){
        alert('Todo creation failed. Please input name length > 2') 
      }else if(Number.isNaN(this.state.expirationTime)){
        alert('Todo creation failed. Please input expiration time as a number')
      }
      else{
        const dueDate = this.calculateDueDate(this.state.expirationTime)
        const newTodo = await createTodo(this.props.auth.getIdToken(), {
          name: this.state.newTodoName,
          dueDate
        })
        if (this.state.file) {
          const uploadUrl = await getUploadUrl(this.props.auth.getIdToken(), newTodo.todoId)
          await uploadFile(uploadUrl, this.state.file)
          newTodo.attachmentUrl = uploadUrl
          this.setState({
            todos: [...this.state.todos, newTodo],
            newTodoName: '',
            expirationTime: 1,
          })
        }else{
          this.setState({
            todos: [...this.state.todos, newTodo],
            newTodoName: '',
            expirationTime: 1,
          })
        }
        alert(`Todo creation successfully`)
      }
    } catch {
      alert('Todo creation failed')
    }
  }

  onTodoDelete = async (todoId: string) => {
    try {
      await deleteTodo(this.props.auth.getIdToken(), todoId)
      this.setState({
        todos: this.state.todos.filter(todo => todo.todoId !== todoId)
      })
    } catch {
      alert('Todo deletion failed')
    }
  }

  onTodoCheck = async (pos: number) => {
    try {
      const todo = this.state.todos[pos]
      await patchTodo(this.props.auth.getIdToken(), todo.todoId, {
        name: todo.name,
        dueDate: todo.dueDate,
        done: !todo.done
      })
      this.setState({
        todos: update(this.state.todos, {
          [pos]: { done: { $set: !todo.done } }
        })
      })
    } catch {
      alert('Todo update failed')
    }
  }

  async componentDidMount() {
    try {
      const todos = await getTodos(this.props.auth.getIdToken())
      this.setState({
        todos,
        loadingTodos: false
      })
    } catch (e) {
      alert(`Failed to fetch todos: ${(e as Error).message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">TODOs</Header>

        {this.renderCreateTodoInput()}

        {this.renderTodos()}
      </div>
    )
  }

  renderCreateTodoInput() {
    return (
      <Grid.Row>
        <Segment>
          <Form>
            <Form.Field required>
              <label>Name</label>
              <Input placeholder='Name' onChange={this.handleNameChange} value={this.state.newTodoName}/>
            </Form.Field>
            <Form.Field>
              <label>Expire Time (0-30)</label>
              <Input label={{ basic: true, content: 'days' }} value={this.state.expirationTime} labelPosition='right' placeholder='Expire Time' onChange={this.handleExpireTimeChange} />
            </Form.Field>
            <Form.Field>
            <label>File</label>
            <input
              type="file"
              accept="image/*"
              placeholder="Image to upload"
              onChange={this.handleFileChange}
            />
          </Form.Field>
            <Button primary onClick={() => this.onTodoCreate()}><Icon name="save" />Add TODO Task</Button>
          </Form>
        </Segment>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
    )
  }

  renderTodos() {
    if (this.state.loadingTodos) {
      return this.renderLoading()
    }

    return this.renderTodosList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading TODOs
        </Loader>
      </Grid.Row>
    )
  }

  renderTodosList() {
    return (
      <Grid padded>
        {this.state.todos.map((todo, pos) => {
          return (
            <Grid.Row key={todo.todoId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onTodoCheck(pos)}
                  checked={todo.done}
                />
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                {todo.name}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {todo.dueDate}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(todo.todoId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onTodoDelete(todo.todoId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {todo.attachmentUrl && (
                <Image src={todo.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  calculateDueDate(expireTime: number): string {
    const date = new Date()
    date.setDate(date.getDate() + expireTime)
    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}

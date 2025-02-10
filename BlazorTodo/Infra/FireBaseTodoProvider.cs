

public class FireBaseTodoProvider : ITodoRepository
{
    public async Task<IEnumerable<TodoItem>> GetTodos()
    {
        throw new NotImplementedException();
    }

    public async Task<TodoItem> GetTodoById(string id)
    {
        throw new NotImplementedException();
    }

    public async Task<TodoItem> AddTodo(TodoItem todoItem)
    {
        throw new NotImplementedException();
    }

    public async Task DeleteTodoById(string id)
    {
        throw new NotImplementedException();
    }
}

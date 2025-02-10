
// create a class for todo
public class TodoItem
{
    public string Id { get; set; }
    public string Action { get; set; }
    public bool IsDone { get; set; }
}

// create repository interface for Todo item
public interface ITodoRepository
{
    Task<IEnumerable<TodoItem>> GetTodos();
    Task<TodoItem> GetTodoById(string id);
    Task<TodoItem> AddTodo(TodoItem todoItem);
    Task DeleteTodoById(string id);
}

// create a service class for todo items which will use repository to get data
public class TodoService
{
    private readonly ITodoRepository _todoRepository;

    public TodoService(ITodoRepository todoRepository)
    {
        _todoRepository = todoRepository;
    }

    public async Task<IEnumerable<TodoItem>> GetTodos()
    {
        return await _todoRepository.GetTodos();
    }

    public async Task<TodoItem> GetTodoById(string id)
    {
        return await _todoRepository.GetTodoById(id);
    }

    public async Task<TodoItem> AddTodo(TodoItem todoItem)
    {
        return await _todoRepository.AddTodo(todoItem);
    }

    public async Task DeleteTodoById(string id)
    {
        await _todoRepository.DeleteTodoById(id);
    }
}


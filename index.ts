// Interfaces para las tareas
interface Task {
    id: string;
    text: string;
    priority: 'baja' | 'media' | 'alta';
    completed: boolean;
    createdAt: Date;
}

// Clase principal de la aplicación
class TaskFlowApp {
    private tasks: Task[] = [];
    private taskForm: HTMLFormElement;
    private taskInput: HTMLInputElement;
    private taskPriority: HTMLSelectElement;
    private tasksContainer: HTMLElement;
    private filterButtons: NodeListOf<HTMLButtonElement>;

    constructor() {
        this.initializeElements();
        this.loadTasks();
        this.setupEventListeners();
        this.renderTasks();
    }

    private initializeElements(): void {
        this.taskForm = document.getElementById('task-form') as HTMLFormElement;
        this.taskInput = document.getElementById('task-input') as HTMLInputElement;
        this.taskPriority = document.getElementById('task-priority') as HTMLSelectElement;
        this.tasksContainer = document.getElementById('tasks-container') as HTMLElement;
        this.filterButtons = document.querySelectorAll('.filter-btn');
    }

    private setupEventListeners(): void {
        // Evento para añadir tareas
        this.taskForm.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.addTask();
        });

        // Eventos para los filtros
        this.filterButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.filterTasks(button.dataset.filter);
            });
        });
    }

    private addTask(): void {
        const text = this.taskInput.value.trim();
        if (!text) return;

        const newTask: Task = {
            id: Date.now().toString(),
            text,
            priority: this.taskPriority.value as 'baja' | 'media' | 'alta',
            completed: false,
            createdAt: new Date()
        };

        this.tasks.unshift(newTask);
        this.saveTasks();
        this.renderTasks();
        this.taskInput.value = '';
        this.taskInput.focus();
    }

    private toggleTask(id: string): void {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            this.saveTasks();
            this.renderTasks();
        }
    }

    private deleteTask(id: string): void {
        this.tasks = this.tasks.filter(t => t.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    private filterTasks(filter: string | null): void {
        // Actualizar botones de filtro
        this.filterButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.filter === filter);
        });

        // Renderizar tareas filtradas
        this.renderTasks(filter);
    }

    private renderTasks(filter: string | null = 'all'): void {
        let filteredTasks = this.tasks;

        switch (filter) {
            case 'pending':
                filteredTasks = this.tasks.filter(t => !t.completed);
                break;
            case 'completed':
                filteredTasks = this.tasks.filter(t => t.completed);
                break;
        }

        this.tasksContainer.innerHTML = '';

        if (filteredTasks.length === 0) {
            this.tasksContainer.innerHTML = `
                <div class="empty-state">
                    <p>No hay tareas ${filter === 'pending' ? 'pendientes' : filter === 'completed' ? 'completadas' : ''}</p>
                </div>
            `;
            return;
        }

        filteredTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.tasksContainer.appendChild(taskElement);
        });
    }

    private createTaskElement(task: Task): HTMLElement {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task ${task.completed ? 'completed' : ''} priority-${task.priority}`;
        
        const priorityColors = {
            'baja': '#10b981',
            'media': '#f59e0b',
            'alta': '#ef4444'
        };

        taskDiv.innerHTML = `
            <div class="task-content">
                <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                <span class="task-text">${this.escapeHtml(task.text)}</span>
                <span class="task-priority" style="background-color: ${priorityColors[task.priority]}">
                    ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
            </div>
            <button class="delete-btn">🗑️</button>
        `;

        // Event listeners
        const checkbox = taskDiv.querySelector('.task-checkbox') as HTMLInputElement;
        checkbox.addEventListener('change', () => this.toggleTask(task.id));

        const deleteBtn = taskDiv.querySelector('.delete-btn') as HTMLButtonElement;
        deleteBtn.addEventListener('click', () => this.deleteTask(task.id));

        return taskDiv;
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private saveTasks(): void {
        localStorage.setItem('taskflow-tasks', JSON.stringify(this.tasks));
    }

    private loadTasks(): void {
        const savedTasks = localStorage.getItem('taskflow-tasks');
        if (savedTasks) {
            this.tasks = JSON.parse(savedTasks, (key, value) => {
                if (key === 'createdAt') {
                    return new Date(value);
                }
                return value;
            });
        }
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    new TaskFlowApp();
});

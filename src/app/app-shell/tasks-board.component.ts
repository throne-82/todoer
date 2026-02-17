import { Component, computed, effect, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { switchMap } from 'rxjs';
import { ListsService } from '../firebase/lists.service';
import { TasksService } from '../firebase/tasks.service';
import { Task, TodoList } from '../shared/models';
import { TaskItemComponent } from './task-item.component';

@Component({
  selector: 'app-tasks-board',
  standalone: true,
  imports: [FormsModule, TaskItemComponent],
  templateUrl: './tasks-board.component.html'
})
export class TasksBoardComponent {
  private readonly tasksService = inject(TasksService);
  private readonly listsService = inject(ListsService);

  readonly selectedListId = input<string | null>(null);

  readonly lists = toSignal(this.listsService.getLists(), { initialValue: [] as TodoList[] });

  readonly tasks = toSignal(
    toObservable(this.selectedListId).pipe(
      switchMap((listId) => this.tasksService.getTasks(listId ?? null))
    ),
    { initialValue: [] as Task[] }
  );

  readonly newTaskTitle = signal('');
  readonly createListId = signal<string | null>(null);
  readonly addError = signal<string | null>(null);

  readonly boardTitle = computed(() => {
    const listId = this.selectedListId();
    if (!listId) {
      return 'THRONE82 TODO';
    }

    const currentList = this.lists().find((item) => item.id === listId);
    return (currentList?.name ?? 'THRONE82 TODO').toUpperCase();
  });

  readonly wipTasks = computed(() => this.sortByUpdatedAt(this.tasks().filter((task) => task.status === 'wip'), 'desc'));
  readonly todoTasks = computed(() => this.sortByUpdatedAt(this.tasks().filter((task) => task.status === 'todo'), 'desc'));
  readonly doneTasks = computed(() => this.sortByUpdatedAt(this.tasks().filter((task) => task.status === 'done'), 'asc'));

  constructor() {
    effect(() => {
      const selected = this.selectedListId();
      const availableLists = this.lists();

      if (selected) {
        this.createListId.set(selected);
        return;
      }

      const stillExists = availableLists.some((list) => list.id === this.createListId());
      if (!stillExists) {
        this.createListId.set(availableLists[0]?.id ?? null);
      }
    });
  }

  async createTask(): Promise<void> {
    this.addError.set(null);

    const title = this.newTaskTitle().trim();
    const listId = this.createListId();

    if (!title) {
      return;
    }

    if (!listId) {
      this.addError.set('Crie uma lista antes de adicionar tarefas.');
      return;
    }

    await this.tasksService.createTask(title, listId);
    this.newTaskTitle.set('');
  }

  private sortByUpdatedAt(tasks: Task[], order: 'asc' | 'desc'): Task[] {
    const factor = order === 'desc' ? -1 : 1;

    return [...tasks].sort((a, b) => {
      const aTime = a.updatedAt?.toMillis() ?? a.createdAt?.toMillis() ?? 0;
      const bTime = b.updatedAt?.toMillis() ?? b.createdAt?.toMillis() ?? 0;
      if (aTime === bTime) {
        return 0;
      }

      return aTime > bTime ? factor : -factor;
    });
  }
}

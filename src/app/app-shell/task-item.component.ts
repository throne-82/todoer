import { Component, computed, inject, input, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TasksService } from '../firebase/tasks.service';
import { Task } from '../shared/models';

@Component({
  selector: 'app-task-item',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './task-item.component.html',
  styleUrl: './task-item.component.css'
})
export class TaskItemComponent {
  private readonly tasksService = inject(TasksService);

  readonly task = input.required<Task>();

  readonly editing = signal(false);
  readonly draftTitle = signal('');

  readonly isDone = computed(() => this.task().status === 'done');

  async cycleStatus(): Promise<void> {
    await this.tasksService.cycleTaskStatus(this.task());
  }

  beginEdit(): void {
    this.draftTitle.set(this.task().title);
    this.editing.set(true);
  }

  async saveEdit(): Promise<void> {
    const title = this.draftTitle().trim();
    if (!title) {
      this.editing.set(false);
      return;
    }

    if (title !== this.task().title) {
      await this.tasksService.updateTaskTitle(this.task().id, title);
    }

    this.editing.set(false);
  }

  cancelEdit(): void {
    this.editing.set(false);
  }

  async removeTask(): Promise<void> {
    await this.tasksService.deleteTask(this.task().id);
  }

  statusClass(): string {
    const status = this.task().status;
    if (status === 'done') {
      return 'status-done';
    }

    if (status === 'wip') {
      return 'status-wip';
    }

    return 'status-todo';
  }
}

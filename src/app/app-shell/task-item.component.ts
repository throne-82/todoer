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
  readonly showListTag = input(false);
  readonly listName = input('Sem lista');
  readonly listColor = input('#64748b');

  readonly editing = signal(false);
  readonly draftTitle = signal('');
  readonly expanded = signal(false);
  readonly draftDescription = signal('');
  readonly draftDueTime = signal('');
  readonly draftImportant = signal(false);

  readonly isDone = computed(() => this.task().status === 'done');
  readonly isImportant = computed(() => this.task().isImportant === true);

  async cycleStatus(): Promise<void> {
    await this.tasksService.cycleTaskStatus(this.task());
  }

  beginEdit(): void {
    this.draftTitle.set(this.task().title);
    this.editing.set(true);
  }

  toggleExpanded(): void {
    const nextExpanded = !this.expanded();
    this.expanded.set(nextExpanded);

    if (nextExpanded) {
      this.draftDescription.set(this.task().description ?? '');
      this.draftDueTime.set(this.task().dueTime ?? '');
      this.draftImportant.set(this.task().isImportant ?? false);
    }
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

  async saveDetails(): Promise<void> {
    const current = this.task();
    const nextDescription = this.draftDescription().trim();
    const nextDueTime = this.draftDueTime();
    const nextImportant = this.draftImportant();

    const hasChanged =
      (current.description ?? '') !== nextDescription ||
      (current.dueTime ?? '') !== nextDueTime ||
      (current.isImportant ?? false) !== nextImportant;

    if (!hasChanged) {
      return;
    }

    await this.tasksService.updateTaskDetails(current.id, {
      description: nextDescription,
      dueTime: nextDueTime,
      isImportant: nextImportant
    });
  }

  async toggleImportant(): Promise<void> {
    this.draftImportant.set(!this.draftImportant());
    await this.saveDetails();
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

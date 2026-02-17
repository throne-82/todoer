import { Component, inject, input, output, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ListsService } from '../firebase/lists.service';
import { ListModalComponent } from './list-modal.component';
import { TodoList } from '../shared/models';

@Component({
  selector: 'app-lists-sidebar',
  standalone: true,
  imports: [ListModalComponent],
  templateUrl: './lists-sidebar.component.html',
  styleUrl: './lists-sidebar.component.css'
})
export class ListsSidebarComponent {
  private readonly listsService = inject(ListsService);

  readonly selectedListId = input<string | null>(null);
  readonly selectList = output<string | null>();

  readonly lists = toSignal(this.listsService.getLists(), { initialValue: [] as TodoList[] });

  readonly modalOpen = signal(false);
  readonly editingList = signal<TodoList | null>(null);

  openCreateModal(): void {
    this.editingList.set(null);
    this.modalOpen.set(true);
  }

  openEditModal(list: TodoList): void {
    this.editingList.set(list);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  async onSave(payload: { id?: string; name: string; color: string }): Promise<void> {
    if (payload.id) {
      await this.listsService.updateList(payload.id, payload.name, payload.color);
    } else {
      await this.listsService.createList(payload.name, payload.color);
    }

    this.closeModal();
  }

  async deleteList(list: TodoList): Promise<void> {
    const confirmed = window.confirm(
      `Excluir a lista "${list.name}" e todas as tarefas vinculadas a ela?`
    );

    if (!confirmed) {
      return;
    }

    await this.listsService.deleteList(list.id);

    if (this.selectedListId() === list.id) {
      this.selectList.emit(null);
    }
  }
}

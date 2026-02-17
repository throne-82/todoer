import { Component, input, output, signal, effect } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TodoList } from '../shared/models';

interface ListModalSaveEvent {
  id?: string;
  name: string;
  color: string;
}

@Component({
  selector: 'app-list-modal',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './list-modal.component.html',
  styleUrl: './list-modal.component.css'
})
export class ListModalComponent {
  readonly isOpen = input(false);
  readonly editList = input<TodoList | null>(null);

  readonly cancelled = output<void>();
  readonly saved = output<ListModalSaveEvent>();

  readonly name = signal('');
  readonly color = signal('#38bdf8');

  readonly palette = ['#38bdf8', '#60a5fa', '#8b5cf6', '#14b8a6', '#fb7185', '#f59e0b'];

  constructor() {
    effect(() => {
      if (!this.isOpen()) {
        return;
      }

      const current = this.editList();
      this.name.set(current?.name ?? '');
      this.color.set(current?.color ?? this.palette[0]);
    });
  }

  close(): void {
    this.cancelled.emit();
  }

  submit(): void {
    if (!this.name().trim()) {
      return;
    }

    this.saved.emit({
      id: this.editList()?.id,
      name: this.name().trim(),
      color: this.color()
    });
  }
}

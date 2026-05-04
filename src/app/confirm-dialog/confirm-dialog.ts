import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  templateUrl: './confirm-dialog.html',
})
export class ConfirmDialog implements OnChanges, AfterViewInit {
  @Input() open = false;

  @Input() title = 'Confirm action';
  @Input() message = 'Are you sure?';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';

  @Output() openChange = new EventEmitter<boolean>();
  @Output() confirmed = new EventEmitter<void>();

  @ViewChild('confirmModal')
  confirmModal?: ElementRef<HTMLDialogElement>;

  private viewReady = false;

  ngAfterViewInit() {
    this.viewReady = true;
    this.syncDialogState();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['open']) {
      this.syncDialogState();
    }
  }

  private syncDialogState() {
    if (!this.viewReady) return;

    const dialog = this.confirmModal?.nativeElement;
    if (!dialog) return;

    if (this.open && !dialog.open) {
      dialog.showModal();
    }

    if (!this.open && dialog.open) {
      dialog.close();
    }
  }

  close() {
    this.openChange.emit(false);
  }

  confirm() {
    this.confirmed.emit();
    this.close();
  }
}

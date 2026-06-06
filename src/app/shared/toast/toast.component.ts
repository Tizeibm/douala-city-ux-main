import { ChangeDetectorRef, Component, NgZone, OnInit } from '@angular/core';
import { FeedbackService } from '../feedback.service';
import { Observable, Subscription, timer } from 'rxjs';

@Component({
  selector: 'app-toast',
  standalone: false,
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToastComponent implements OnInit {

  constructor(public feedback: FeedbackService, private cd: ChangeDetectorRef,
    private ngZone: NgZone
  ) { }

  toast: {
    message: string;
    type: 'success' | 'error';
  } | null = null;


  close() {

    this.feedback.clear();
  }

  ngOnInit(): void {
    this.feedback.toast$.subscribe(t => {
      this.ngZone.run(() => {
        this.toast = t;
        if (t) {
          setTimeout(() => {
            this.close();
            this.cd.detectChanges();
          }, 3000);
        }
      });
    });
  }


}

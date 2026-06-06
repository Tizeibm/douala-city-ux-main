import { Component, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { FeedbackService } from '../feedback.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-global-loader',
  standalone: false,
  templateUrl: './global-loader.component.html',
  styleUrl: './global-loader.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GlobalLoaderComponent implements OnInit {

  loading$!: Observable<boolean>;
  constructor(private feedback: FeedbackService){}

  ngOnInit(): void {
   this.loading$ = this.feedback.loading$;
  }
}

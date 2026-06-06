import { Component, ChangeDetectionStrategy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-edit-avis',
  standalone: false,
  templateUrl: './edit-avis.component.html',
  styleUrl: './edit-avis.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditAvisComponent {

form!: FormGroup;

constructor(
  private fb: FormBuilder,
  private route: ActivatedRoute,
  private router: Router
  
){}

ngOnInit(){

  this.form =this.fb.group({
    id: [''],
    note: [null, Validators.required],
    commentaire: ['', Validators.required]
  });

  const avisId = Number(this.route.snapshot.paramMap.get('avisId'));
}

onSubmit(){

}

onCancel(){

 }
}
 
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { InscriptionService } from '../services/inscription.service';



export enum StructureType {
    ADMINISTRATIONPUBLIQUE,
    COMMERCE,
    EDUCATION,
    ENERGIE,
    FINANCEASSURANCE,
    HEBERGEMENTRESTAURATION,
    PRESTATAIREINDIVIDUEL,
    SANTE,
    SECURITE,
    SPORTLOISIRS,
    TELECOMNUMERIQUE,
    TOURISMECULTURE,
    TRANSPORTLOGISTIQUE,
    SERVICESSPECIALISES
}

@Component({
  selector: 'app-entreprise',
  standalone: false,
  templateUrl: './entreprise.component.html',
  styleUrl: './entreprise.component.scss'
})

export class EntrepriseComponent  {

passwordError: string='';
confirmError: string='';
confirmPassword: string= '';
categoriesFiltrees :string[]=[];

categor: string[]= [];

//form!: FormGroup;

  entreprise={
    nom:'',
    password:'',
    email:'',
    telephone:'',
    type:{
      nom:'',
      type: null,
      categories : this.categor
    },
    categorie:'',
    precision:''
  };

  

  types:{
   nom: string,
   type: StructureType | null,
   categories: string[] 
  } []=[
    {
      nom: 'administration',
      type: StructureType.ADMINISTRATIONPUBLIQUE,
      categories: [
        'mairies',
        'ministères',
        'services publics'
      ]
    },
    {
      nom: 'santé',
      type: StructureType.SANTE,
      categories: [
        'hôpitaux',
        'cliniques',
        'pharmacies',
        'laboratoires'
      ]
    },
    {
      nom: 'education',
      type: StructureType.EDUCATION,
      categories: [
        'écoles',
        'universités',
        'centres de formation'
      ]
    },
    {
      nom: 'commerce/artisanat',
      type: StructureType.COMMERCE,
      categories: [
        'boutique',
        'marchés',
        'ateliers',
        'artisans'
      ]
    },
    {
      nom: 'culture/loisirs',
      type: StructureType.SPORTLOISIRS,
      categories: [
        'musées',
        'cinémas',
        'salles de sport',
        'parcs'

      ]
    },
    {
      nom: 'transport',
      type: StructureType.TRANSPORTLOGISTIQUE,
      categories: [
        'stations',
        'agences de voyage',
        'taxis',
        'moto-taxis'
      ]
    },
    {
      nom: 'services spécialisés',
      type: StructureType.SERVICESSPECIALISES,
      categories: [
        'banques',
        'notaires',
        'avocats',
        'architectes'
      ]
    }



  ]

 /* 
constructor(private fb: FormBuilder){
  
}
ngOnInit(): void {
  this.form = this.fb.group({
    type: ['', Validators.required],
    categorie: ['',
      Validators.required
    ],
    email:['',Validators.required],
    password: ['', Validators.required,
      [Validators.minLength(6)  ]]
  });

  
this.form.get('type')?.valueChanges.subscribe(entreprise=>{
this.categoriesFiltrees= this.entreprise.type.categories || [];
this.form.get('categorie')?.reset('');
}); */
//} 
  
validatePassword(){

  const password= this.entreprise.password;
  const regex=/^((?=\S*?[A-Z])(?=\S*?[a-z])(?=\S*?[0-9]).{6,})\S$/;

  if(!regex.test(password)){
    this.passwordError= 'Le mot de passe doit contenir au moins 8 caractères, avec une majuscule, une minuscule, un chiffre et un caractère spécial.';
  }else{
    this.passwordError='';
  }

  if(this.confirmPassword && password !==this.confirmPassword){
    this.confirmError="Les mots de passe ne correspondent pas.";
  } else{
    this.confirmError='';
  }
}

 constructor(private inscriptionService: InscriptionService){}

messageSucces: string | null = null;
messageErreur: string | null = null;

onSubmit(){

  this.inscriptionService.inscrireEntreprise(this.entreprise).subscribe({
    next: () => {
      this.messageSucces= 'Inscription réussie Bienvenue !';
       this.messageErreur= null;
    },
    error: (err) =>{
      this.messageErreur='Une erreur est survenue lors de l inscription';
      this.messageSucces= null;
    }
  });
  
} 

  onTypeChange(){

this.categoriesFiltrees= this.entreprise.type.categories || [];

console.log(this.entreprise.type.categories);
  }  

}

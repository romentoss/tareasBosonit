import { FormularioComponent } from './../formulario/formulario/formulario.component';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { catchError, EMPTY, iif, Observable, switchMap, tap } from 'rxjs';
import { Countries } from 'src/app/interfaces/countries';
import { User } from 'src/app/interfaces/users';




import {  EventEmitter, Input, Output } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ApiService } from 'src/app/services/api.service';


@Component({
  selector: 'app-padre',
  templateUrl: './padre.component.html',
  styleUrls: ['./padre.component.css']
})
export class PadreComponent implements OnInit {
  countries$!: Observable<Countries[]>;
  form!:FormGroup;
  user!:User;
  userList!:User[];
 
  @ViewChild(FormularioComponent) formFormulario;
  
 
  

  constructor(private api:ApiService,private http:HttpClient) { 
    this.form = new FormGroup({
      id: new FormControl(''),
      name: new FormControl('',Validators.required),
      password: new FormControl('',Validators.required),
      password2: new FormControl('',Validators.required),
      email: new FormControl('',[Validators.required,Validators.email]),
      promo: new FormControl(false),
      country: new FormControl(''),
      city: new FormControl('',Validators.required),
    }
    //validar buscar
    );
  }
   
  //cuando tenga promo es obligado el email  y sin true promo no es required
  ngOnInit(): void {
    this.countries$ = this.api.getAllCountries();
  
    this.api.listUsers().subscribe((data) => {
      this.userList = data;
    })
    
    
  }
  ngAfterViewInit() {
    this.form = this.formFormulario.form;

  }
  
  onSubmit(){
    console.log("submit");
    iif(
      () => this.form.value.id,
      this.api.updateUser(this.form.value),
      this.api.createUser(this.form.value)
    ).pipe(switchMap((data) => {
        this.form.reset();
        return this.api.listUsers().pipe(
            tap((updatedList) => {
              this.userList = updatedList;
            })
          );
        }),
        catchError((e: any) => {
          console.error(e);
          return EMPTY;
        })
      ).subscribe();
    // switch(this.form.value.id){
    //   case '':
    //     this.api.createUser(this.form.value).subscribe(
    //       (data)=>{
    //         this.user = data;
    //         this.form.reset();
    //         this.userList.push(this.user);
    //       });
    //     break;
    //   default:
    //     this.api.updateUser(this.form.value).subscribe(
    //       (data)=>{
    //         this.user = data;
    //         this.form.reset();
    //         this.api.listUsers().subscribe(
    //           (data)=>{
    //             this.userList = data;
    //           });
    //       });
    //     break;
    // } 
    
  }
  

  updateUser(user:User){
    this.form.patchValue(user);
 
  }
  // updateUser(user:User){
  //   return this.api.updateUser(user);
  // }

    // return this.form.patchValue(user):Observable<any>

    public async getData():Promise<Observable<any>>{
      return this.http.get<any>("http://localhost:3000/users").toPromise();
    }
  
    async initPage(){
      
      let result =await this.getData();
      console.log(result);
      
    };
  
    
  
    updateUserById(user:string){
      console.log("update");
      this.api.getUserId(user).subscribe((data)=>{
        this.updateUser(data);
        
      });
    }
    deleteUserById(user:string){
      
      console.log("delete");
      this.api.deleteUser(user).subscribe(()=>{
        //Preguntar ya que es subscribe dentro de subscribe
        this.api.listUsers().subscribe((data)=>{
          this.userList = data;
        });
      });
    }
  

}
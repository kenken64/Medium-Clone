import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { RouterModule, PreloadAllModules } from '@angular/router';
import { AuthorComponent } from './components/author/author.component';
import { AddAuthorComponent } from './components/author/add-author/add-author.component';
import { EditAuthorComponent } from './components/author/edit-author/edit-author.component';
import { CategoryComponent } from './components/category/category.component';
import { ArticleComponent } from './components/article/article.component';
import { PublishComponent } from './components/article/publish/publish.component';
import { RegistrationComponent } from './shared/security/registration/registration.component';
import { LoginComponent } from './shared/security/login/login.component';
import { ChangePasswordComponent } from './shared/security/change-password/change-password.component';
import { ResetPasswordComponent } from './shared/security/reset-password/reset-password.component';
import { AuthGuard } from './shared/services/auth-guard.service';
import { NoAuthGuard } from './shared/services/no-auth-guard.service';
import { ResetChangepasswordComponent } from './shared/security/reset-changepassword/reset-changepassword.component';

const appRoutes = [
    {
        path: 'Article/:resetId',
        component: ArticleComponent,
    },
    {
        path: 'ResetChngPassword',
        component: ResetChangepasswordComponent,
    },
    {
        path: 'Author',
        component: AuthorComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'Author/Add',
        component: AddAuthorComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'Author/Edit/:id',
        component: EditAuthorComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'Category',
        component: CategoryComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'Publish',
        component: PublishComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'Registration',
        component: RegistrationComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'Login',
        component: LoginComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: 'ChangePassword',
        component: ChangePasswordComponent,
        canActivate: [AuthGuard]
    },
    {
        path: 'ResetPassword',
        component: ResetPasswordComponent,
        canActivate: [NoAuthGuard]
    },
    {
        path: '', 
        redirectTo: '/Article', 
        pathMatch: 'full' 
    },
    {
        path: '**', 
        component: ArticleComponent,
    }
]

@NgModule({
    declarations: [
    
    ],
    imports: [
      BrowserModule,
      RouterModule.forRoot(appRoutes , { enableTracing: true, preloadingStrategy: PreloadAllModules })
    ],
    exports: [ RouterModule ],
    providers: []
  })
export class RoutingModule { }
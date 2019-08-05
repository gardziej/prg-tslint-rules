import { TestBed, async } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AppComponent } from './app.component';
import * as CustomModule from './app.component';
import * as TypeCombiService from './app.component';
import * as LocalStorageService from './app.component';
import * as MockLocalStorageService from './app.component';
import * as UserService from './app.component';
import * as MockUserService from './app.component';
import * as AllowedService from './app.component';
import { BrowserModule } from '@angular/platform-browser';
import { AppRoutingModule } from './app-routing.module';
import { of, range, Observable } from 'rxjs';
import { repeatWhen, takeUntil, switchMap } from 'rxjs/operators';

fdescribe('AppComponent', () => {
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        CustomModule,
        BrowserModule,
        AppRoutingModule,
        RouterTestingModule.withRoutes([]),
        IcDatepickerModule.forRoot()
      ],
      providers: [
        AppComponent,
        TypeCombiService,
        AllowedService,
        {provide: LocalStorageService, useClass: MockLocalStorageService},
        UserService,
        {provide: UserService, useClass: MockUserService},
      ],
      declarations: [
        AppComponent
      ],
    }).compileComponents();
  }));

  fit('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have as title 'custom-tslint'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.title).toEqual('custom-tslint');
  });

  it('should render title in a h1 tag', () => {

    const z: Observable<number> = of(2);

    const source$: Observable<number> = of(20);

    const c = source$.pipe(
      repeatWhen(notifications => range(0, 3))
    );

    let a: Observable<number>;
    let b: Observable<number>;
    let notifier: Observable<any>;

    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const compiled = fixture.debugElement.nativeElement;
    expect(compiled.querySelector('h1').textContent).toContain('Welcome to custom-tslint!');
  });
});

import { HttpErrorResponse, HttpEvent, HttpRequest, HttpHandlerFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { catchError, EMPTY, Observable, throwError } from "rxjs";

export const errorHandlingInterceptor = (req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> => {
  const router = inject(Router);

  // Remove  Page-Load  header before passing the request to the next handler
  const modifiedReq = req.clone({
    headers: req.headers.delete('Page-Load')
  });

  return next(modifiedReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error) {
        const isPageLoad: boolean = req.headers.get('Page-Load') === 'true'; // Use original req to check header

        if (error.status === 400) {
          if (error.error.errors) {
            return throwError(
              () => new Error(JSON.stringify(error.error.errors))
            );
          } else {
            if (!isPageLoad) {
              alert(error.error.message);
            }
          }
        }

        if (error.status === 401) {
          if (!isPageLoad) {
            alert(error.error.message);
          }
        }

        if (error.status === 404) {
          if (isPageLoad) {
            // Navigate to error page and return EMPTY to stop the observable chain
            router.navigate(['/errors/404']);
            return EMPTY;
          } else {
            console.error(error.error.message);
            alert(error.error.message);
          }
        }

        if (error.status === 500) {
          if (isPageLoad) {
            const navigationExtras: NavigationExtras = {
              state: { error: error.error.message }
            };
            router.navigate(['/errors/500'], navigationExtras);
            return EMPTY;
          } else {
            alert(error.error.message);
          }
        }
      }
      return throwError(() => new Error(error.message));
    })
  );
};
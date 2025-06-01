import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-error',
  standalone: true,
  imports: [],
  templateUrl: './error.component.html',
  styleUrl: './error.component.css'
})
export class NotFoundComponent implements OnInit {
  errorCode: string | null = null;
  errorMessage: string = '';

  private errorDictionary: { [key: string]: string } = {
    '404': 'Not Found Exception',
    '500': 'Internal Server Error',
    '403': 'Forbidden',
    '401': 'Unauthorized',
    '400': 'Bad Request',
    '408': 'Request Timeout',
    '429': 'Too Many Requests',
    '503': 'Service Unavailable',
    '504': 'Gateway Timeout',
  };

  constructor(
    private route: ActivatedRoute,
  ) {

  }

  ngOnInit(): void {
    //if a custom state.error was passed via window.history.state
    const stateError = window.history.state?.error;
    if (stateError) {
      this.errorMessage = stateError;
    }

    //subscribe to paramMap and get error code
    this.route.paramMap.subscribe(params => {
      const codeFromRoute = params.get('code');
      this.errorCode = codeFromRoute;

      //code exists in the dictionary and we haven’t already set displayMessage
      if (!stateError && codeFromRoute && this.errorDictionary[codeFromRoute]) {
        this.errorMessage = this.errorDictionary[codeFromRoute]!;
      }

      //neither stateError nor a known code is provided then fallback
      if (!stateError && (!codeFromRoute || !this.errorDictionary[codeFromRoute]!)) {
        this.errorMessage = 'Unknown Error';
      }
    });
  }
}

import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { exhaustMap, finalize, Subject, takeUntil, tap } from 'rxjs';
import { AiService } from '../Shared/Services/ai.service';
import { AiResponse } from '../Shared/Entities/AiResponse';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatChipsModule,
    MatIconModule, CommonModule],
  templateUrl: './ai.component.html',
  styleUrl: './ai.component.scss'
})
export class AiComponent implements OnInit, OnDestroy {
  @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

  inputControl = new FormControl('', Validators.required);
  requestResponseMessages: { text: string; sender: string; timestamp: Date }[] = [];
  suggestedQuestions: string[] = [];
  isLoading = false;
  private sendSubject = new Subject<{ prompt: string; isPageLoad: boolean }>();
  private destroy$ = new Subject<void>();

  private initialQuestionsPool: string[] = [
    'How many bookings do I have',
    'What do I have booked for next week',
    'Do I have anything on May 12?',
    'What was booked last week?',
    'List all my private room bookings.',
    'Show me today\'s schedule',
    'What are my upcoming meetings?',
    'How many rooms are available?',
    'Show me cancelled bookings',
    'What\'s my busiest day this week?'
  ];

  constructor(private aiService: AiService) { }

  ngOnInit(): void {
    this.setupSendPipeline();
    this.initializeSuggestedQuestions();
    setTimeout(() => this.scrollToBottom(), 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private setupSendPipeline(): void {

    this.sendSubject.pipe(
      takeUntil(this.destroy$),
      tap(() => {
        this.isLoading = true;
        // Disable input while loading
        this.inputControl.disable();
      }),
      exhaustMap(({ prompt, isPageLoad }) =>
        this.aiService.getAiResponse(prompt, isPageLoad).pipe(
          finalize(() => {
            this.isLoading = false;
            // Re-enable input after response
            this.inputControl.enable();
            setTimeout(() => this.scrollToBottom(), 100);
          })
        )
      )
    ).subscribe({
      next: (response: AiResponse) => {

        if (response.isSuccess) {
          this.requestResponseMessages.push({
            text: response.answer,
            sender: 'ai',
            timestamp: new Date()
          });
          this.updateSuggestedQuestions(response.suggestedQuestions);
        }
        else {
          this.requestResponseMessages.push({
            text: 'Error: ' + (response.errorMessage || 'Unknown error occurred'),
            sender: 'ai',
            timestamp: new Date()
          });
          this.suggestedQuestions = [];
        }
      },
      error: (err) => {
        console.error('AI request failed', err);
        this.requestResponseMessages.push({
          text: 'An error occurred while fetching AI response. Please try again.',
          sender: 'ai',
          timestamp: new Date()
        });
        this.isLoading = false;
        this.inputControl.enable();
      }
    });
  }

  private initializeSuggestedQuestions(): void {
    this.suggestedQuestions = this.getRandomItems(this.initialQuestionsPool, 3);
  }

  private updateSuggestedQuestions(list: string[]): void {
    if (!list || list.length === 0) {
      this.suggestedQuestions = this.getRandomItems(this.initialQuestionsPool, 3);
      return;
    }
    this.suggestedQuestions = list.slice(0, 3);
  }

  private getRandomItems(arr: string[], count: number): string[] {
    const copy = [...arr];
    const result: string[] = [];
    const n = Math.min(count, copy.length);

    for (let i = 0; i < n; i++) {
      const idx = Math.floor(Math.random() * copy.length);
      result.push(copy[idx]);
      copy.splice(idx, 1);
    }
    return result;
  }

  onSuggestionClick(question: string): void {
    if (this.isLoading) return; // Prevent action while loading

    this.inputControl.setValue(question);
  }

  onSend(): void {
    if (this.isLoading || this.inputControl.disabled) return; // Prevent send while loading

    const raw = this.inputControl.value;
    if (!raw || !raw.trim()) {
      return;
    }

    const question = raw.trim();

    // Push user message to chat 
    this.requestResponseMessages.push({
      text: question,
      sender: 'user',
      timestamp: new Date()
    });

    this.inputControl.setValue('');
    setTimeout(() => this.scrollToBottom(), 50);
    this.sendSubject.next({ prompt: question, isPageLoad: false });
  }

  // Scroll chat container to bottom
  private scrollToBottom(): void {
    try {
      if (this.scrollContainer?.nativeElement) {
        const el: HTMLElement = this.scrollContainer.nativeElement;
        el.scrollTop = el.scrollHeight;
      }
    } catch (err) {
      console.warn('Could not scroll chat container', err);
    }
  }

  get canSend(): boolean {
    return !this.isLoading &&
      !this.inputControl.disabled &&
      !!this.inputControl.value?.trim();
  }

  formatAiText(text: string): string {
    return text
      .replace(/\n/g, '<br>')
      .replace(/- /g, '<span class="ai-list-bullet">•</span> ');
  }
}
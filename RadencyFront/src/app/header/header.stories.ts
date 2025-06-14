import { moduleMetadata, StoryFn, Meta } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { Store } from '@ngrx/store';
import { HeaderComponent } from './header.component';

export default {
    title: 'Components/Header',
    component: HeaderComponent,
    decorators: [
        moduleMetadata({
            imports: [
                CommonModule,
                MatToolbarModule,
                MatButtonModule,
                MatIconModule,
                RouterTestingModule,
            ],
            providers: [

            ],
        }),
    ],
    // We don't have @Input for bookingsCount; we'll pass a custom arg to control mock store
    argTypes: {
        bookingsCount: {
            control: {
                type: 'number',
            },
            description: 'Number of bookings to show in header (used to configure mock store)',
        },
    },
} as Meta<HeaderComponent>;

const Template: StoryFn<HeaderComponent & { bookingsCount: number }> = (args) => {
    const mockStore = {
        select: (_selector?: any) => {
            return of(args.bookingsCount);
        },
        dispatch: (_action: any) => {

        },
    };
    return {
        props: {
        },
        moduleMetadata: {
            providers: [
                { provide: Store, useValue: mockStore },
            ],
            imports: [
                CommonModule,
                MatToolbarModule,
                MatButtonModule,
                MatIconModule,
                RouterTestingModule,
            ],
        },
    };
};

export const Default = Template.bind({});
Default.args = {
    bookingsCount: 3,
};

export const ManyBookings = Template.bind({});
ManyBookings.args = {
    bookingsCount: 42,
};
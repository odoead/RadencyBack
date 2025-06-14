import { moduleMetadata, Meta, StoryFn } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { BookingCardComponent } from './booking-card.component';
import { Booking } from '../Shared/Entities/Booking';



export default {
  title: 'Components/BookingCard',
  component: BookingCardComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, MatCardModule, MatButtonModule],
    }),
  ],
  argTypes: {
    edit: { action: 'edit clicked' },
    delete: { action: 'delete clicked' },
  },
} as Meta<BookingCardComponent>;

const Template: StoryFn<BookingCardComponent> = (args) => ({
  props: args,
});

export const Default = Template.bind({});
Default.args = {
  booking: {
    id: 1,
    userName: 'John Doe',
    userEmail: 'user@example.com',
    workspaceUnitId: 1,
    workspaceType: 'Private Room',
    workspaceCapacity: 5,
    coworkingName: 'coworkingName',
    startTimeLOC: new Date('2025-06-15T14:00:00').toISOString(),
    endTimeLOC: new Date('2025-06-15T16:30:00').toISOString(),
    timeZoneId: 'Europe/Kyiv',
  } as Booking,
};


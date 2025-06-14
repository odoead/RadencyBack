import { moduleMetadata, Meta, StoryFn } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CoworkingListComponent } from './coworking-list.component';
import { CoworkingMin } from '../Shared/Entities/CoworkingMin';
import { CoworkingService } from '../Shared/Services/coworking.service';
import { MatCommonModule } from '@angular/material/core';



export default {
    title: 'Components/CoworkingList',
    component: CoworkingListComponent,
    decorators: [
        moduleMetadata({
            imports: [
                MatCommonModule,
                MatCardModule,
                MatButtonModule,
                MatIconModule,
                RouterTestingModule,
            ],
            // providers will be set per story
        }),
    ],
    argTypes: {
        coworkings: {
            control: 'object',
            description: 'Array of coworking items to display',
        },
    },
} as Meta<CoworkingListComponent>;

// Template that uses args.coworkings to stub the service
const Template: StoryFn<CoworkingListComponent & { coworkings: CoworkingMin[] }> = (args) => {
    const mockService = {
        getAllCoworkingsDetails: (_flag: boolean) => of(args.coworkings),
    };

    return {
        props: {},
        moduleMetadata: {
            providers: [
                { provide: CoworkingService, useValue: mockService },
            ],
        },
    };
};

const SAMPLE_COWORKINGS: CoworkingMin[] = [
    {
        id: 1,
        name: 'CoworkSpace Kyiv Central',
        address: 'Khreshchatyk St, Kyiv, Ukraine',
        photoUrl: 'https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ',
        totalCoworkingCapacity: 100,
        totalWorkspaceUnitCount: 50,
        openWorkspaceUnitCount: 20,
        privateWorkspaceUnitCount: 20,
        meetingWorkspaceUnitCount: 10,

    },
    {
        id: 2,
        name: 'CoworkSpace Lviv Downtown',
        address: 'Market Sq, Lviv, Ukraine',
        photoUrl: 'https://fastly.picsum.photos/id/2/5000/3333.jpg?hmac=_KDkqQVttXw_nM-RyJfLImIbafFrqLsuGO5YuHqD-qQ',
        totalCoworkingCapacity: 80,
        totalWorkspaceUnitCount: 40,
        openWorkspaceUnitCount: 15,
        privateWorkspaceUnitCount: 15,
        meetingWorkspaceUnitCount: 10,
    },
];

export const Empty = Template.bind({});
Empty.args = {
    coworkings: [],
};

export const WithItems = Template.bind({});
WithItems.args = {
    coworkings: SAMPLE_COWORKINGS,
};
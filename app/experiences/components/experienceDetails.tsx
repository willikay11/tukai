'use client';

import IconComponent from '@/app/components/iconComponent';
import { Button } from '@/components/ui/button';
import moment from 'moment';
import { Experience } from '@/types/experience';
import numeral from 'numeral';

export default function ExperienceDetails({ experience }: { experience: Experience }) {
  return (
    <>
      <div className="flex flex-row">
        <div className="mr-2 flex">
          <IconComponent iconName="Clock01Icon" size={18} />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-700">Date & Duration</p>
          <p className="mt-1 text-sm font-normal text-gray-500">
            {moment(experience.startDate).format('MMM D, YYYY')} -{' '}
            {moment(experience.endDate).format('MMM D, YYYY')}
          </p>
          <Button variant="primary-text" size="sm" className="mt-1 justify-start">
            View Other Dates
          </Button>
        </div>
      </div>

      <div className="flex flex-row">
        <div className="mr-2 flex">
          <IconComponent iconName="Money03Icon" size={18} />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-700">Charges</p>
          <ul className="mt-1 list-disc pl-4">
            {experience.tickets.map((ticket) => (
              <li className="text-sm font-normal text-gray-500">
                <span className="text-gray-700">{ticket.name}</span>&nbsp;-&nbsp;
                <span className="text-gray-500">
                  {experience.currency} {numeral(ticket.price).format('0,0')}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="flex flex-row">
        <div className="mr-2 flex">
          <IconComponent iconName="MapPinpoint02Icon" size={18} />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-700">Location</p>
          <Button variant="primary-text" size="sm" className="justify-start">
            {experience.location.formattedAddress}
          </Button>
        </div>
      </div>

      <div className="flex flex-row">
        <div className="mr-2 flex">
          <IconComponent iconName="WorkoutStretchingIcon" size={18} />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-700">Experience Type</p>
          <p className="text-sm font-normal text-gray-500">
            {experience.isPublic ? 'Public' : 'Private (Only invited guests can join)'}
          </p>
        </div>
      </div>

      <div className="flex flex-row">
        <div className="mr-2 flex">
          <IconComponent iconName="CallIcon" size={18} />
        </div>
        <div className="flex flex-col">
          <p className="text-sm font-medium text-gray-700">Phone</p>
          <p className="text-sm font-normal text-gray-500">{/* {experience.host} */}</p>
        </div>
      </div>
    </>
  );
}

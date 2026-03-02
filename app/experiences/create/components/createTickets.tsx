'use client';

import { useMemo } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import IconComponent from '@/app/components/iconComponent';
import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Input } from '@/components/ui/input';
import { TimePicker } from '@/components/ui/time-picker';
import { toast } from '@/hooks/use-toast';

const commissionOptions = [
	{ value: 'organizer', label: 'I will fully pay the commission' },
	{ value: 'customer', label: 'The customer will pay the commission' },
	{ value: 'split', label: 'Split 50-50 between the customer and myself' },
] as const;

const ticketSchema = z.object({
	ticketName: z.string().min(1, 'Ticket name is required'),
	quantity: z.preprocess(
		(value) => {
			if (value === '' || value === null || value === undefined) {
				return undefined;
			}

			const parsedValue = Number(value);
			return Number.isNaN(parsedValue) ? value : parsedValue;
		},
		z
			.number({
				required_error: 'Quantity is required',
				invalid_type_error: 'Quantity is required',
			})
			.int()
			.min(1, 'Quantity must be at least 1'),
	),
	amount: z.preprocess(
		(value) => {
			if (value === '' || value === null || value === undefined) {
				return undefined;
			}

			const parsedValue = Number(value);
			return Number.isNaN(parsedValue) ? value : parsedValue;
		},
		z.number({
			required_error: 'Amount is required',
			invalid_type_error: 'Amount is required',
		}).min(1, 'Amount must be greater than 0'),
	),
	salesStartDate: z.string().min(1, 'Start date is required'),
	salesStartTime: z.string().min(1, 'Start time is required'),
	salesEndDate: z.string().min(1, 'End date is required'),
	salesEndTime: z.string().min(1, 'End time is required'),
});

const createTicketsSchema = z.object({
	commissionPayer: z.enum(['organizer', 'customer', 'split']),
	selectedDateSummary: z.string().min(1),
	tickets: z.array(ticketSchema).min(1),
});

type CreateTicketsFormValues = z.input<typeof createTicketsSchema>;

const currencyFormatter = new Intl.NumberFormat('en-KE', {
	minimumFractionDigits: 2,
	maximumFractionDigits: 2,
});

function formatKes(value: number) {
	return `KES ${currencyFormatter.format(Number.isFinite(value) ? value : 0)}`;
}

export default function CreateTickets() {
	const form = useForm<CreateTicketsFormValues>({
		resolver: zodResolver<CreateTicketsFormValues>(createTicketsSchema),
		mode: 'onChange',
		defaultValues: {
			commissionPayer: 'organizer',
			selectedDateSummary: '24/03/2026 - 06:00 AM - 09:00 PM',
			tickets: [
				{
					ticketName: '',
						quantity: '',
						amount: '',
					salesStartDate: '',
					salesStartTime: '',
					salesEndDate: '',
					salesEndTime: '',
				},
			],
		},
	});

	const { register, control, watch, setValue, handleSubmit, formState } = form;
	const { errors, isValid, isSubmitting } = formState;

	const { fields, append, remove } = useFieldArray({
		control,
		name: 'tickets',
	});

	const watchedTickets = watch('tickets');
	const commissionPayer = watch('commissionPayer');
	const selectedDateSummary = watch('selectedDateSummary');

	const totals = useMemo(() => {
		const totalTicketsCost = (watchedTickets || []).reduce((sum, ticket) => {
			const quantity = Number(ticket.quantity) || 0;
			const amount = Number(ticket.amount) || 0;
			return sum + quantity * amount;
		}, 0);

		const firstTicketAmount = Number(
			(watchedTickets || []).find((ticket) => Number(ticket.amount) > 0)?.amount || 0,
		);

		const customerCommissionRate =
			commissionPayer === 'customer' ? 0.04 : commissionPayer === 'split' ? 0.02 : 0;

		const customerSees = firstTicketAmount * (1 + customerCommissionRate);

		return {
			totalTicketsCost,
			customerSees,
		};
	}, [commissionPayer, watchedTickets]);

	const onSubmit = () => {
		toast({
			title: 'Tickets saved',
			description: 'Ticket details have been saved successfully.',
		});
	};

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="h-full">
			<h2 className="text-xl font-semibold text-gray-900">Create Tickets</h2>

			<p className="mt-4 text-xs text-gray-700">
				Fees allocation{' '}
				<span className="text-gray-500">
					(Tukai charges a 4% commission, who should pay this commission?)
				</span>
			</p>

			<div className="mt-3 space-y-3">
				{commissionOptions.map((option) => (
					<label key={option.value} className="flex cursor-pointer items-center gap-3 text-sm text-gray-800">
						<input
							type="radio"
							value={option.value}
							{...register('commissionPayer')}
							className="h-4 w-4 border-gray-300 accent-primary"
						/>
						<span className='text-xs'>{option.label}</span>
					</label>
				))}
			</div>

			<div className="mt-5 inline-flex items-center gap-2 rounded-full border border-dashed border-primary bg-emerald-100 px-4 py-2 text-sm font-medium text-gray-900">
				<IconComponent iconName="Calendar03Icon" size={16} color="#064E3B" />
				<span className="text-xs text-green-900">Date: {selectedDateSummary}</span>
				<IconComponent iconName="ArrowDown01Icon" size={16} color="#064E3B" />
			</div>
			<input type="hidden" {...register('selectedDateSummary')} />

			<div className="mt-4 space-y-5">
				{fields.map((field, index) => {
					const ticketErrors = errors.tickets?.[index];

					return (
						<div key={field.id} className="space-y-3">
							<Input
								placeholder="Ticket Name e.g. VIP, Early Bird, Locals etc..."
								suffixIcon={<IconComponent iconName="Ticket01Icon" size={16} color="#9CA3AF" />}
								{...register(`tickets.${index}.ticketName`)}
							/>
							{ticketErrors?.ticketName && (
								<p className="text-xs text-red-500">{ticketErrors.ticketName.message}</p>
							)}

							<Input
								type="number"
								min={1}
								placeholder="Available Ticket Quantity"
								suffixIcon={<IconComponent iconName="ArrowUpDownIcon" size={16} color="#9CA3AF" />}
								{...register(`tickets.${index}.quantity`)}
							/>
							{ticketErrors?.quantity && (
								<p className="text-xs text-red-500">{ticketErrors.quantity.message}</p>
							)}

							<Input
								type="number"
								min={1}
								placeholder="Amount per ticket"
								suffixIcon={<IconComponent iconName="Money03Icon" size={16} color="#9CA3AF" />}
								{...register(`tickets.${index}.amount`)}
							/>
							{ticketErrors?.amount && (
								<p className="text-xs text-red-500">{ticketErrors.amount.message}</p>
							)}

							<p className="mt-1 text-xs font-semibold text-gray-900">
								Ticket Sales Validity{' '}
								<span className="font-normal text-gray-600">
									(When should the sales of these tickets start and end)
								</span>
							</p>

							<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
								<div>
									<DatePicker
										value={watch(`tickets.${index}.salesStartDate`) || ''}
										onChange={(value) =>
											setValue(`tickets.${index}.salesStartDate`, value, {
												shouldValidate: true,
												shouldDirty: true,
											})
										}
										placeholder="Start Date"
									/>
									{ticketErrors?.salesStartDate && (
										<p className="mt-1 text-xs text-red-500">{ticketErrors.salesStartDate.message}</p>
									)}
								</div>

								<div>
									<TimePicker
										value={watch(`tickets.${index}.salesStartTime`) || ''}
										onChange={(value) =>
											setValue(`tickets.${index}.salesStartTime`, value, {
												shouldValidate: true,
												shouldDirty: true,
											})
										}
										placeholder="Start Time"
									/>
									{ticketErrors?.salesStartTime && (
										<p className="mt-1 text-xs text-red-500">{ticketErrors.salesStartTime.message}</p>
									)}
								</div>

								<div>
									<DatePicker
										value={watch(`tickets.${index}.salesEndDate`) || ''}
										onChange={(value) =>
											setValue(`tickets.${index}.salesEndDate`, value, {
												shouldValidate: true,
												shouldDirty: true,
											})
										}
										placeholder="End Date"
									/>
									{ticketErrors?.salesEndDate && (
										<p className="mt-1 text-xs text-red-500">{ticketErrors.salesEndDate.message}</p>
									)}
								</div>

								<div>
									<TimePicker
										value={watch(`tickets.${index}.salesEndTime`) || ''}
										onChange={(value) =>
											setValue(`tickets.${index}.salesEndTime`, value, {
												shouldValidate: true,
												shouldDirty: true,
											})
										}
										placeholder="End Time"
									/>
									{ticketErrors?.salesEndTime && (
										<p className="mt-1 text-xs text-red-500">{ticketErrors.salesEndTime.message}</p>
									)}
								</div>
							</div>

							{fields.length > 1 && (
								<button
									type="button"
									onClick={() => remove(index)}
									className="text-xs font-medium text-red-500"
								>
									Remove ticket type
								</button>
							)}
						</div>
					);
				})}
			</div>

			<div className="mt-3 flex items-center gap-2 rounded-full bg-blue-100 px-3 py-2 text-xs text-gray-700">
				<span className="italic">
					Total Tickets Cost:{' '}
					<span className="font-semibold text-gray-900">{formatKes(totals.totalTicketsCost)}</span>
				</span>
				<span>•</span>
				<span className="italic">
					What the customer sees:{' '}
					<span className="font-semibold text-gray-900">{formatKes(totals.customerSees)}</span>
				</span>
			</div>

			<button
				type="button"
				onClick={() =>
					append({
						ticketName: '',
						quantity: '',
						amount: '',
						salesStartDate: '',
						salesStartTime: '',
						salesEndDate: '',
						salesEndTime: '',
					})
				}
				className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary"
			>
				<IconComponent iconName="PlusSignCircleIcon" size={16} color="#047857" />
				Add another Ticket Type
			</button>

			<div className="mt-5">
				<Button
					type="submit"
					variant="gradient"
					disabled={!isValid || isSubmitting}
					className="rounded-full px-5 text-xs text-white"
				>
					Save Tickets
				</Button>
			</div>
		</form>
	);
}

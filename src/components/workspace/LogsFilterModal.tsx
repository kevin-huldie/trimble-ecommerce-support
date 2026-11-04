import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DEFAULT_ADVANCED_FILTER_FIELDS,
  DELIVERY_STATUS_OPTIONS,
  TRIGGERING_EVENT_OPTIONS,
  type AdvancedFilterFields,
  type LogDeliveryStatus,
} from '../../data/mockLogs';
import { getStatusBadgeStyle } from '../../utils/getStatusBadgeStyle';
import { InlineFieldError } from '../InlineFieldError';

export type LogsFilterModalProps = {
  id: string;
  values: AdvancedFilterFields;
  onChange: (values: AdvancedFilterFields) => void;
  onApply: () => void;
  onClear: () => void;
  recipientEmailError?: string | null;
  dateRangeError?: string | null;
  onRecipientEmailBlur?: () => void;
};

function FieldLabel({ htmlFor, children }: { htmlFor?: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-1 block text-xs font-bold text-[#121212]">
      {children}
    </label>
  );
}

function TextField({
  id,
  label,
  value,
  placeholder,
  onChange,
  error,
  helperText,
  onBlur,
}: {
  id: string;
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
  onBlur?: () => void;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <input
        id={id}
        type="text"
        value={value}
        placeholder={placeholder}
        aria-invalid={error || undefined}
        aria-describedby={helperText ? `${id}-error` : undefined}
        className={[
          'h-10 w-full rounded-md border bg-white px-3 py-2 text-xs text-[#121212] placeholder:text-[#525866] focus:outline-none focus:ring-2 focus:ring-[#0063A3]',
          error ? 'border-[#DA212C] focus:ring-[#DA212C]' : 'border-[#CBCDD6]',
        ].join(' ')}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
      />
      {helperText ? <InlineFieldError id={`${id}-error`} message={helperText} /> : null}
    </div>
  );
}

function TriggeringEventSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <FieldLabel htmlFor={id}>Triggering event</FieldLabel>
      <div className="relative">
        <select
          id={id}
          value={value}
          className="h-10 w-full cursor-pointer appearance-none rounded-md border border-[#CBCDD6] bg-white py-2 pl-3 pr-9 text-xs text-[#121212] focus:outline-none focus:ring-2 focus:ring-[#0063A3]"
          onChange={(e) => onChange(e.target.value)}
        >
          {TRIGGERING_EVENT_OPTIONS.map((opt) => (
            <option key={opt.value || 'all-events'} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#525866]"
          aria-hidden
        />
      </div>
    </div>
  );
}

const DELIVERY_STATUS_SELECTED_CLASSES: Record<LogDeliveryStatus | '', string> = {
  '': 'bg-[#0063A3] text-white font-bold',
  Delivered: `${getStatusBadgeStyle('Delivered')} font-bold`,
  Bounced: `${getStatusBadgeStyle('Bounced')} font-bold`,
  Deferred: `${getStatusBadgeStyle('Deferred')} font-bold`,
  Pending: `${getStatusBadgeStyle('Pending')} font-bold`,
  Held: `${getStatusBadgeStyle('Held')} font-bold`,
};

function deliveryStatusChipClasses(
  optionValue: LogDeliveryStatus | '',
  selectedStatus: LogDeliveryStatus | '',
): string {
  const base =
    'rounded-md px-3 py-1.5 text-xs transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-1';

  if (selectedStatus === optionValue) {
    return `${base} border border-transparent ${DELIVERY_STATUS_SELECTED_CLASSES[optionValue]}`;
  }

  return `${base} border border-transparent bg-[#CBCDD6]/40 font-medium text-[#121212] hover:bg-[#CBCDD6]/60`;
}

function DeliveryStatusToggle({
  value: selectedStatus,
  onChange,
}: {
  value: LogDeliveryStatus | '';
  onChange: (value: LogDeliveryStatus | '') => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block text-xs font-bold text-[#121212]">Delivery status</span>
      <div className="flex max-w-full flex-wrap gap-2" role="group" aria-label="Delivery status">
        {DELIVERY_STATUS_OPTIONS.map((opt) => {
          const selected = selectedStatus === opt.value;
          return (
            <button
              key={opt.label}
              type="button"
              aria-pressed={selected}
              className={deliveryStatusChipClasses(opt.value, selectedStatus)}
              onClick={() => onChange(opt.value)}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

const WEEKDAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] as const;

function parseIsoDate(value: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y!, m! - 1, d);
  if (Number.isNaN(date.getTime())) return null;
  return date;
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate()
  );
}

function buildCalendarCells(viewMonth: Date): (Date | null)[] {
  const first = startOfMonth(viewMonth);
  const leadingBlanks = first.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = Array.from({ length: leadingBlanks }, () => null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function CalendarGrid({
  value,
  onSelect,
}: {
  value: string;
  onSelect: (iso: string) => void;
}) {
  const selected = parseIsoDate(value);
  const initialView = selected ?? new Date();
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(initialView));
  const today = useMemo(() => new Date(), []);
  const cells = useMemo(() => buildCalendarCells(viewMonth), [viewMonth]);
  const monthLabel = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    year: 'numeric',
  }).format(viewMonth);

  return (
    <div className="w-[16.5rem]">
      <div className="mb-2 flex items-center justify-between gap-2">
        <button
          type="button"
          aria-label="Previous month"
          className="inline-flex h-7 w-7 items-center justify-center rounded text-[#121212] hover:bg-[#F1F1F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
          onClick={() => setViewMonth((m) => addMonths(m, -1))}
        >
          <ChevronLeft className="h-4 w-4" aria-hidden />
        </button>
        <span className="text-xs font-bold text-[#121212]">{monthLabel}</span>
        <button
          type="button"
          aria-label="Next month"
          className="inline-flex h-7 w-7 items-center justify-center rounded text-[#121212] hover:bg-[#F1F1F6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
          onClick={() => setViewMonth((m) => addMonths(m, 1))}
        >
          <ChevronRight className="h-4 w-4" aria-hidden />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center text-[10px] font-bold text-[#525866]">
        {WEEKDAY_LABELS.map((label) => (
          <span key={label} className="py-1">
            {label}
          </span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-0.5" role="grid" aria-label={monthLabel}>
        {cells.map((cell, index) => {
          if (!cell) {
            return <span key={`blank-${index}`} className="h-8" aria-hidden />;
          }
          const iso = toIsoDate(cell);
          const selectedDay = selected ? isSameDay(cell, selected) : false;
          const isToday = isSameDay(cell, today);
          return (
            <button
              key={iso}
              type="button"
              role="gridcell"
              aria-selected={selectedDay}
              aria-label={new Intl.DateTimeFormat(undefined, { dateStyle: 'full' }).format(cell)}
              className={[
                'h-8 rounded text-xs font-semibold focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]',
                selectedDay
                  ? 'bg-[#0063A3] text-white'
                  : isToday
                    ? 'border border-[#0063A3] text-[#0063A3] hover:bg-[#E5F1F8]'
                    : 'text-[#121212] hover:bg-[#F1F1F6]',
              ].join(' ')}
              onClick={() => onSelect(iso)}
            >
              {cell.getDate()}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DatePickerField({
  id,
  label,
  value,
  invalid,
  describedBy,
  isOpen,
  onOpenChange,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  invalid: boolean;
  describedBy: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onChange: (iso: string) => void;
}) {
  const anchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (anchorRef.current?.contains(event.target as Node)) return;
      onOpenChange(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onOpenChange]);

  const inputClass = [
    'w-full cursor-pointer rounded-md border py-2 pl-3 pr-10 text-xs text-[#121212] focus:outline-none focus:ring-2',
    invalid
      ? 'border-[#DA212C] bg-[#FDF2F2] focus:ring-[#DA212C]'
      : 'border-[#CBCDD6] focus:ring-[#0063A3]',
  ].join(' ');

  return (
    <div className="relative w-full">
      <label htmlFor={id} className="mb-1 block text-xs font-bold text-[#121212]">
        {label}
      </label>
      <div className="relative flex items-center" ref={anchorRef}>
        <input
          id={id}
          type="date"
          readOnly
          value={value}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          className={[inputClass, '[&::-webkit-calendar-picker-indicator]:opacity-0'].join(' ')}
          onFocus={() => onOpenChange(true)}
          onClick={() => onOpenChange(true)}
        />
        <Calendar
          aria-hidden
          className="pointer-events-none absolute right-3 h-4 w-4 text-[#525866]"
        />
        {isOpen ? (
          <div
            role="dialog"
            aria-label={`${label} calendar`}
            className="absolute right-0 top-full z-50 mt-1 rounded-md border border-[#CBCDD6] bg-white p-3 shadow-lg"
          >
            <CalendarGrid
              value={value}
              onSelect={(iso) => {
                onChange(iso);
                onOpenChange(false);
              }}
            />
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DateRangeSection({
  formId,
  startDate,
  endDate,
  dateError,
  onStartDateChange,
  onEndDateChange,
}: {
  formId: string;
  startDate: string;
  endDate: string;
  dateError: string | null;
  onStartDateChange: (value: string) => void;
  onEndDateChange: (value: string) => void;
}) {
  const startId = `${formId}-start-date`;
  const endId = `${formId}-end-date`;
  const helpId = `${formId}-date-help-text`;
  const errorId = `${formId}-date-error-msg`;
  const describedBy = dateError ? errorId : helpId;
  const invalid = Boolean(dateError);

  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const handleStartDateChange = (value: string) => {
    onStartDateChange(value);
  };

  const handleEndDateChange = (value: string) => {
    onEndDateChange(value);
  };

  const openStartDate = (open: boolean) => {
    setIsStartDateOpen(open);
    if (open) setIsEndDateOpen(false);
  };

  const openEndDate = (open: boolean) => {
    setIsEndDateOpen(open);
    if (open) setIsStartDateOpen(false);
  };

  return (
    <div className="mb-5 space-y-1.5">
      <div className="grid grid-cols-2 gap-4">
        <DatePickerField
          id={startId}
          label="Start date"
          value={startDate}
          invalid={invalid}
          describedBy={describedBy}
          isOpen={isStartDateOpen}
          onOpenChange={openStartDate}
          onChange={handleStartDateChange}
        />
        <DatePickerField
          id={endId}
          label="End date"
          value={endDate}
          invalid={invalid}
          describedBy={describedBy}
          isOpen={isEndDateOpen}
          onOpenChange={openEndDate}
          onChange={handleEndDateChange}
        />
      </div>

      <p id={helpId} className="mt-1 text-[11px] text-[#525866]">
        Dates are queried in UTC and displayed in your local browser timezone (EDT).
      </p>

      {dateError ? (
        <p
          id={errorId}
          role="alert"
          className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-[#DA212C]"
        >
          <span aria-hidden>⚠️</span> {dateError}
        </p>
      ) : null}
    </div>
  );
}

export function LogsFilterModal({
  id,
  values,
  onChange,
  onApply,
  onClear,
  recipientEmailError,
  dateRangeError,
  onRecipientEmailBlur,
}: LogsFilterModalProps) {
  const patch = (partial: Partial<AdvancedFilterFields>) => {
    onChange({ ...values, ...partial });
  };

  const recipientInvalid = Boolean(recipientEmailError);
  const dateError = dateRangeError ?? null;

  return (
    <div
      id={id}
      role="dialog"
      aria-modal="false"
      aria-labelledby={`${id}-heading`}
      className="w-full"
    >
      <h2 id={`${id}-heading`} className="mb-3 text-sm font-bold leading-tight text-[#121212]">
        Advanced filters
      </h2>

      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id={`${id}-recipient-email`}
            label="Recipient email"
            value={values.recipientEmail}
            placeholder="Enter recipient email"
            error={recipientInvalid}
            helperText={recipientEmailError ?? undefined}
            onChange={(recipientEmail) => patch({ recipientEmail })}
            onBlur={onRecipientEmailBlur}
          />
          <TextField
            id={`${id}-customer-name`}
            label="Customer name"
            value={values.customerName}
            placeholder="Enter customer name"
            onChange={(customerName) => patch({ customerName })}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <TextField
            id={`${id}-order-id`}
            label="Order ID"
            value={values.orderId}
            placeholder="Enter order ID"
            onChange={(orderId) => patch({ orderId })}
          />
          <TriggeringEventSelect
            id={`${id}-triggering-event`}
            value={values.triggeringEvent}
            onChange={(triggeringEvent) => patch({ triggeringEvent })}
          />
        </div>

        <DateRangeSection
          formId={id}
          startDate={values.dateFrom}
          endDate={values.dateTo}
          dateError={dateError}
          onStartDateChange={(dateFrom) => patch({ dateFrom })}
          onEndDateChange={(dateTo) => patch({ dateTo })}
        />

        <DeliveryStatusToggle
          value={values.deliveryStatus}
          onChange={(deliveryStatus) => patch({ deliveryStatus })}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded border border-[#0063A3] bg-white px-4 text-xs font-semibold text-[#0063A3] hover:bg-[#E5F1F8] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3]"
          onClick={onClear}
        >
          Clear filters
        </button>
        <button
          type="button"
          className="inline-flex h-9 items-center justify-center rounded bg-[#0063A3] px-4 text-xs font-semibold text-white hover:bg-[#004f87] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0063A3] focus-visible:ring-offset-1"
          onClick={onApply}
        >
          Apply filters
        </button>
      </div>
    </div>
  );
}

export function advancedFieldsFromFilters(
  filters: AdvancedFilterFields,
): AdvancedFilterFields {
  return {
    recipientEmail: filters.recipientEmail,
    customerName: filters.customerName,
    orderId: filters.orderId,
    triggeringEvent: filters.triggeringEvent,
    deliveryStatus: filters.deliveryStatus,
    dateFrom: filters.dateFrom,
    dateTo: filters.dateTo,
  };
}

export { DEFAULT_ADVANCED_FILTER_FIELDS };

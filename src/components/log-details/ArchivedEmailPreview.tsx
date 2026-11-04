import type { ActivityLogRecord } from '../../data/mockLogs';

type ArchivedEmailPreviewProps = {
  log: ActivityLogRecord;
};

const SAMPLE_LINE_ITEMS = [
  {
    partNumber: 'SKU-TE-10042',
    productName: 'Trimble Access Subscription — Annual',
    quantity: 1,
    unitPrice: '$1,249.00',
    tax: '$0.00',
  },
  {
    partNumber: 'SKU-HW-8841',
    productName: 'Geo 7X Handheld Receiver',
    quantity: 2,
    unitPrice: '$3,895.00',
    tax: '$0.00',
  },
  {
    partNumber: 'SKU-SVC-220',
    productName: 'Extended Support — 12 months',
    quantity: 1,
    unitPrice: '$420.00',
    tax: '$0.00',
  },
];

export function ArchivedEmailPreview({ log }: ArchivedEmailPreviewProps) {
  const fullName = `${log.recipientFirstName} ${log.recipientLastName}`.trim();

  return (
    <article className="mx-auto w-full max-w-[640px] rounded border border-[#CBCDD6] bg-white text-[#121212] shadow-sm">
      <header className="border-b border-[#CBCDD6] bg-white px-6 py-4">
        <div className="flex flex-col gap-1">
          <span className="text-lg font-bold tracking-tight text-[#0063A3]">TRIMBLE</span>
          <span className="text-[11px] text-[#525866]">Transforming the way the world works</span>
        </div>
      </header>

      <div className="space-y-4 px-6 py-5 text-xs leading-relaxed">
        <p className="text-sm font-semibold text-[#121212]">Hi {fullName},</p>
        <p className="text-[#121212]">
          Your order <strong className="font-semibold">#{log.displayOrderId}</strong> has been placed
          on hold pending verification of your State Tax Exemption Certificate. No items will ship
          until our compliance team confirms your documentation.
        </p>

        <div>
          <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-[#121212]">
            Order summary
          </h3>
          <div className="overflow-x-auto rounded border border-[#CBCDD6]">
            <table className="w-full min-w-[520px] border-collapse text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#CBCDD6] bg-[#F1F1F6]">
                  <th scope="col" className="px-2 py-1.5 font-bold">
                    Part number
                  </th>
                  <th scope="col" className="px-2 py-1.5 font-bold">
                    Product name
                  </th>
                  <th scope="col" className="px-2 py-1.5 font-bold text-right">
                    Qty
                  </th>
                  <th scope="col" className="px-2 py-1.5 font-bold text-right">
                    Unit price
                  </th>
                  <th scope="col" className="px-2 py-1.5 font-bold text-right">
                    Tax
                  </th>
                </tr>
              </thead>
              <tbody>
                {SAMPLE_LINE_ITEMS.map((row) => (
                  <tr key={row.partNumber} className="border-b border-[#CBCDD6] last:border-b-0">
                    <td className="px-2 py-1.5 font-mono tabular-nums">{row.partNumber}</td>
                    <td className="px-2 py-1.5">{row.productName}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{row.quantity}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{row.unitPrice}</td>
                    <td className="px-2 py-1.5 text-right tabular-nums">{row.tax}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded border border-[#CBCDD6] bg-[#F1F1F6]/50 p-3">
          <h3 className="mb-2 text-xs font-bold text-[#121212]">Payment &amp; billing</h3>
          <dl className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            <div>
              <dt className="text-[#525866]">Payment method</dt>
              <dd className="font-medium">Corporate purchase card •••• 4242</dd>
            </div>
            <div>
              <dt className="text-[#525866]">Authorization status</dt>
              <dd className="font-medium">Authorized — pending tax review</dd>
            </div>
            <div>
              <dt className="text-[#525866]">Billing account</dt>
              <dd className="font-medium">Northstar Manufacturing LLC</dd>
            </div>
            <div>
              <dt className="text-[#525866]">Order total (excl. tax)</dt>
              <dd className="font-medium tabular-nums">$9,459.00</dd>
            </div>
          </dl>
          <p className="mt-2 text-[11px] text-[#525866]">
            Original payment attempt recorded at checkout. Funds remain authorized until the hold is
            released or the order is cancelled.
          </p>
        </div>

        <p className="text-[#121212]">
          Upload your certificate in the Trimble Account Center or reply to this message with your
          documentation attached. Our team typically completes review within 2 business days.
        </p>
      </div>

      <footer className="border-t border-[#CBCDD6] bg-[#F1F1F6] px-6 py-4 text-[10px] leading-relaxed text-[#525866]">
        <p className="font-semibold text-[#121212]">Trimble eCommerce</p>
        <p className="mt-1">
          This is an automated transactional message. Please do not reply directly to this email
          address.
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} Trimble Inc. All rights reserved. · Privacy · Terms · Account
          Center
        </p>
      </footer>
    </article>
  );
}

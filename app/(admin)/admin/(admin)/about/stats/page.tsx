import FormWrapper from '@/components/Admin/Form/FormWrapper';
import FormInput from '@/components/Admin/Form/Input';
import { RoleGuard } from '@/components/Admin/Common/RoleGuard';
import { getSetting, updateSettings } from '../../setting/actions/setting.action';

const defaults = [
  { value: '10,000+', label: 'Products Sold', detail: 'Across Pakistan', icon: 'ShoppingBag' },
  { value: '5,000+', label: 'Happy Customers', detail: 'And growing', icon: 'UsersRound' },
  { value: 'Checked & Tested', label: 'By Tech Experts', detail: 'Quality assured', icon: 'ShieldCheck' },
  { value: 'Nationwide', label: 'Delivery', detail: 'At your doorstep', icon: 'Truck' },
];

export default async function AboutStatsPage() {
  const { setting } = await getSetting('about_stats');

  return (
    <RoleGuard permission="about_view">
      <div className="w-full md:-mt-4 mt-1">
        <FormWrapper
          action={updateSettings.bind(null, 'about_stats', '/admin/about/stats')}
          buttonTitle="Update Stats"
          successMessage="About stats updated successfully"
          href="/admin/about/stats"
        >
          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
            <h1 className="text-lg font-bold text-gray-900">About page stats</h1>
            <p className="mt-1 text-sm text-gray-500">
              These four highlights appear below the Who We Are section. Icons accept any Lucide icon name.
            </p>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            {defaults.map((item, index) => {
              const number = index + 1;
              return (
                <section key={number} className="space-y-4 rounded-lg border border-gray-200 p-5">
                  <h2 className="font-bold text-gray-900">Stat {number}</h2>
                  <FormInput
                    label="Value"
                    required
                    name={`item${number}Value`}
                    defaultValue={setting?.[`item${number}Value`] || item.value}
                  />
                  <FormInput
                    label="Label"
                    required
                    name={`item${number}Label`}
                    defaultValue={setting?.[`item${number}Label`] || item.label}
                  />
                  <FormInput
                    label="Accessible detail"
                    name={`item${number}Detail`}
                    defaultValue={setting?.[`item${number}Detail`] || item.detail}
                  />
                  <FormInput
                    label="Lucide icon name"
                    required
                    name={`item${number}Icon`}
                    placeholder="ShieldCheck"
                    defaultValue={setting?.[`item${number}Icon`] || item.icon}
                  />
                </section>
              );
            })}
          </div>
        </FormWrapper>
      </div>
    </RoleGuard>
  );
}

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  CalendarDays,
  CheckCircle2,
  Filter,
  LogIn,
  LogOut,
  PackagePlus,
  Plane,
  RefreshCw,
  Search,
  ShieldCheck,
  Ship,
  Trash2,
  Upload,
  Users,
  X,
} from "lucide-react";
import Pagination from "../../components/Pagination.jsx";
import { useUserActivityStore } from "../../store/useUserActivityStore.js";

const moduleConfig = {
  authentication: {
    label: "Authentication",
    icon: ShieldCheck,
    color: "bg-violet-50 text-violet-700 ring-violet-100",
  },
  air_voyage: {
    label: "Air Voyage",
    icon: Plane,
    color: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  sea_voyage: {
    label: "Sea Voyage",
    icon: Ship,
    color: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
  sea_container: {
    label: "Sea Container",
    icon: PackagePlus,
    color: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  sea_assignment: {
    label: "Sea Assignment",
    icon: CheckCircle2,
    color: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  user_management: {
    label: "Users & Clients",
    icon: Users,
    color: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-100",
  },
  customer_code: {
    label: "Customer Codes",
    icon: PackagePlus,
    color: "bg-orange-50 text-orange-700 ring-orange-100",
  },
  branch_management: {
    label: "Branches",
    icon: ShieldCheck,
    color: "bg-purple-50 text-purple-700 ring-purple-100",
  },
  company_management: {
    label: "Companies",
    icon: Users,
    color: "bg-pink-50 text-pink-700 ring-pink-100",
  },
  app_content: {
    label: "App Content",
    icon: Upload,
    color: "bg-indigo-50 text-indigo-700 ring-indigo-100",
  },
  package_management: {
    label: "Packages",
    icon: PackagePlus,
    color: "bg-amber-50 text-amber-700 ring-amber-100",
  },
  bill_of_lading: {
    label: "Bill of Lading",
    icon: CheckCircle2,
    color: "bg-teal-50 text-teal-700 ring-teal-100",
  },
  notification: {
    label: "Notifications",
    icon: Activity,
    color: "bg-blue-50 text-blue-700 ring-blue-100",
  },
  shipping_line: {
    label: "Shipping Lines",
    icon: Ship,
    color: "bg-cyan-50 text-cyan-700 ring-cyan-100",
  },
  container_company: {
    label: "Container Companies",
    icon: Ship,
    color: "bg-sky-50 text-sky-700 ring-sky-100",
  },
  sea_batch: {
    label: "Sea Batches",
    icon: PackagePlus,
    color: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  },
  product_type: {
    label: "Product Types",
    icon: PackagePlus,
    color: "bg-lime-50 text-lime-700 ring-lime-100",
  },
  qr_management: {
    label: "QR Management",
    icon: CheckCircle2,
    color: "bg-slate-100 text-slate-700 ring-slate-200",
  },
};

const actionConfig = {
  login: { label: "Login", icon: LogIn, color: "bg-emerald-50 text-emerald-700" },
  logout: { label: "Logout", icon: LogOut, color: "bg-slate-100 text-slate-700" },
  create: { label: "Created", icon: PackagePlus, color: "bg-blue-50 text-blue-700" },
  create_container: { label: "Container Created", icon: PackagePlus, color: "bg-blue-50 text-blue-700" },
  upload: { label: "Uploaded", icon: Upload, color: "bg-indigo-50 text-indigo-700" },
  export: { label: "Exported", icon: ArrowDownToLine, color: "bg-cyan-50 text-cyan-700" },
  export_container: { label: "Exported", icon: ArrowDownToLine, color: "bg-cyan-50 text-cyan-700" },
  close: { label: "Closed", icon: CheckCircle2, color: "bg-amber-50 text-amber-700" },
  delete: { label: "Deleted", icon: Trash2, color: "bg-rose-50 text-rose-700" },
  delete_product: { label: "Product Deleted", icon: Trash2, color: "bg-rose-50 text-rose-700" },
  delete_container: { label: "Container Deleted", icon: Trash2, color: "bg-rose-50 text-rose-700" },
  approve_client: { label: "Client Approved", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700" },
  reject_client: { label: "Client Rejected", icon: X, color: "bg-rose-50 text-rose-700" },
  resubmit_client: { label: "Client Resubmitted", icon: RefreshCw, color: "bg-amber-50 text-amber-700" },
  update: { label: "Updated", icon: RefreshCw, color: "bg-blue-50 text-blue-700" },
  assign: { label: "Assigned", icon: CheckCircle2, color: "bg-violet-50 text-violet-700" },
  send_notification: { label: "Notification Sent", icon: Activity, color: "bg-indigo-50 text-indigo-700" },
  add_branch_admin: { label: "Admin Added", icon: Users, color: "bg-emerald-50 text-emerald-700" },
  remove_branch_admin: { label: "Admin Removed", icon: Trash2, color: "bg-rose-50 text-rose-700" },
  update_branch_admin: { label: "Admin Updated", icon: RefreshCw, color: "bg-blue-50 text-blue-700" },
  change_password: { label: "Password Changed", icon: ShieldCheck, color: "bg-violet-50 text-violet-700" },
  remove_package_product: { label: "Product Removed", icon: Trash2, color: "bg-rose-50 text-rose-700" },
  update_package_weight: { label: "Weight Updated", icon: RefreshCw, color: "bg-blue-50 text-blue-700" },
};

const titleCase = (value = "") =>
  value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const UserActivities = () => {
  const {
    activities,
    summary,
    availableFilters,
    pagination,
    isLoading,
    getActivities,
  } = useUserActivityStore();

  const [filters, setFilters] = useState({
    search: "",
    module: "",
    action: "",
    startDate: "",
    endDate: "",
  });

  const query = useMemo(() => ({ ...filters }), [filters]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getActivities({ page: 1, ...query });
    }, 300);
    return () => clearTimeout(timer);
  }, [query, getActivities]);

  const updateFilter = (name, value) => {
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      module: "",
      action: "",
      startDate: "",
      endDate: "",
    });
  };

  const hasFilters = Object.values(filters).some(Boolean);

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const formatTime = (date) =>
    new Date(date).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const statCards = [
    {
      label: "Logins, Last 24 Hours",
      value: summary.loginsLast24Hours,
      helper: "Successful portal access",
      icon: LogIn,
      style: "from-violet-50 to-indigo-50 text-slate-900",
      iconStyle: "bg-violet-600 text-white",
    },
    {
      label: "Uploads Today",
      value: summary.uploadsToday,
      helper: "New cargo records uploaded",
      icon: Upload,
      style: "from-blue-50 to-indigo-50 text-slate-900",
      iconStyle: "bg-blue-600 text-white",
    },
    {
      label: "Voyage Changes Today",
      value: summary.voyageChangesToday,
      helper: "Air and sea operations",
      icon: Ship,
      style: "from-emerald-50 to-teal-50 text-slate-900",
      iconStyle: "bg-emerald-600 text-white",
    },
    {
      label: "Deletions Today",
      value: summary.destructiveActionsToday,
      helper: "Actions requiring review",
      icon: Trash2,
      style: "from-rose-50 to-orange-50 text-slate-900",
      iconStyle: "bg-rose-600 text-white",
    },
  ];

  return (
    <div className="min-h-full">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <div className="mb-1.5 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-indigo-600">
            <ShieldCheck className="size-4" />
            Audit & Security
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
            User Activity
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor access and review operational changes across the business.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Audit logging active
          </div>
          <button
            type="button"
            onClick={() => getActivities({ page: pagination.currentPage, ...query })}
            disabled={isLoading}
            title="Refresh activity"
            className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 shadow-sm transition hover:border-indigo-200 hover:text-indigo-600 disabled:opacity-60"
          >
            <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={`rounded-2xl bg-gradient-to-br p-5 shadow-sm ring-1 ring-black/5 ${card.style}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider opacity-65">
                    {card.label}
                  </p>
                  <p className="mt-2 text-3xl font-semibold">{card.value || 0}</p>
                  <p className="mt-1 text-xs opacity-60">{card.helper}</p>
                </div>
                <div className={`rounded-xl p-2.5 ${card.iconStyle}`}>
                  <Icon className="size-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={filters.search}
              onChange={(event) => updateFilter("search", event.target.value)}
              placeholder="Search user, voyage, operation, or details..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:bg-white focus:ring-4 focus:ring-indigo-50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <Filter className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <select
                value={filters.module}
                onChange={(event) => updateFilter("module", event.target.value)}
                className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-8 text-sm outline-none focus:border-indigo-400"
              >
                <option value="">All modules</option>
                {availableFilters.modules.map((moduleName) => (
                  <option key={moduleName} value={moduleName}>
                    {moduleConfig[moduleName]?.label || titleCase(moduleName)}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={filters.action}
              onChange={(event) => updateFilter("action", event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-indigo-400"
            >
              <option value="">All actions</option>
              {availableFilters.actions.map((action) => (
                <option key={action} value={action}>
                  {actionConfig[action]?.label || titleCase(action)}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-500">
              <CalendarDays className="size-4" />
              <input
                type="date"
                value={filters.startDate}
                onChange={(event) => updateFilter("startDate", event.target.value)}
                className="py-2.5 text-sm text-slate-700 outline-none"
                title="Start date"
              />
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 text-slate-500">
              <CalendarDays className="size-4" />
              <input
                type="date"
                value={filters.endDate}
                onChange={(event) => updateFilter("endDate", event.target.value)}
                className="py-2.5 text-sm text-slate-700 outline-none"
                title="End date"
              />
            </label>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-200"
              >
                <X className="size-4" />
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">Audit Timeline</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Showing {pagination.totalItems || 0} matching records
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Live audit enabled
          </div>
        </div>

        {isLoading ? (
          <div className="flex min-h-80 flex-col items-center justify-center text-slate-500">
            <RefreshCw className="mb-3 size-8 animate-spin text-indigo-600" />
            <p className="text-sm">Loading activity intelligence...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center text-slate-500">
            <div className="mb-3 rounded-2xl bg-slate-100 p-4">
              <Activity className="size-8 text-slate-400" />
            </div>
            <p className="font-medium text-slate-700">No activity found</p>
            <p className="mt-1 text-sm">Try adjusting the current filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Action</th>
                  <th className="px-4 py-3.5">Module</th>
                  <th className="px-4 py-3.5">Context</th>
                  <th className="px-4 py-3.5">Activity Details</th>
                  <th className="px-5 py-3.5 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {activities.map((activity) => {
                  const actorName =
                    activity.actor?.username ||
                    activity.actorSnapshot?.username ||
                    "System";
                  const module = moduleConfig[activity.module] || {
                    label: titleCase(activity.module),
                    icon: Activity,
                    color: "bg-slate-100 text-slate-700 ring-slate-200",
                  };
                  const action = actionConfig[activity.action] || {
                    label: titleCase(activity.action),
                    icon: Activity,
                    color: "bg-slate-100 text-slate-700",
                  };
                  const ModuleIcon = module.icon;
                  const ActionIcon = action.icon;

                  return (
                    <tr
                      key={activity._id}
                      className="group transition hover:bg-indigo-50/30"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-800 to-indigo-800 text-xs font-semibold text-white shadow-sm">
                            {actorName.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{actorName}</p>
                            <p className="mt-0.5 text-xs capitalize text-slate-500">
                              {activity.actorSnapshot?.adminRoles?.[0]?.replaceAll("_", " ") ||
                                activity.actorSnapshot?.role ||
                                "system"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ${action.color}`}>
                          <ActionIcon className="size-3.5" />
                          {action.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium ring-1 ${module.color}`}>
                          <ModuleIcon className="size-3.5" />
                          {module.label}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <p className="font-medium text-slate-800">
                          {activity.voyageNumber
                            ? `Voyage ${activity.voyageNumber}`
                            : activity.metadata?.loginType
                              ? titleCase(`${activity.metadata.loginType} portal`)
                              : "-"}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {activity.branchId?.branchName || "Global access"}
                        </p>
                      </td>
                      <td className="max-w-md px-4 py-4">
                        <p className="leading-5 text-slate-700">
                          {activity.description}
                        </p>
                        {activity.ipAddress && (
                          <p className="mt-1 truncate text-[11px] text-slate-400">
                            IP: {activity.ipAddress}
                          </p>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right">
                        <p className="font-medium text-slate-700">
                          {formatDate(activity.createdAt)}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {formatTime(activity.createdAt)}
                        </p>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination.totalPages > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200/80 shadow-sm">
          <Pagination
            {...pagination}
            onPageChange={(page) => getActivities({ page, ...query })}
          />
        </div>
      )}
    </div>
  );
};

export default UserActivities;

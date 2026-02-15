interface ErrorAlertProps {
  message: string | null;
  icon?: string;
}

export function ErrorAlert({ message, icon = '❌' }: ErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="border border-error text-error p-3 rounded mb-4 text-sm">
      {icon} {message}
    </div>
  );
}

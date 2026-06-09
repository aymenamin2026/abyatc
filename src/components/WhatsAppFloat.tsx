"use client";

export default function WhatsAppFloat({ settings }: { settings: any }) {
  // إذا لم توجد إعدادات، لا نظهر الزر
  if (!settings) return null;

  const rawNumber = settings?.whatsapp || settings?.whatsapp_phone || settings?.whatsapp_number || settings?.phone || "";
  const whatsappNumber = rawNumber ? rawNumber.replace(/\D/g, '') : "966500000000"; 
  const whatsappUrl = `https://wa.me/${whatsappNumber}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      // لاحظ كلمة start-6 هنا، هي التي تجعل الزر يتحرك لليمين في العربي ولليسار في الإنجليزي
      className="fixed bottom-20 start-6 z-50 flex items-center justify-center w-14 h-14 bg-emerald-500 text-white rounded-full shadow-lg hover:bg-emerald-600 transition-all hover:scale-110 active:scale-95 animate-bounce"
    >
      <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12.21 2c-5.464 0-9.91 4.39-9.91 9.782 0 1.723.454 3.407 1.316 4.898L2 22l5.485-1.422a9.96 9.96 0 004.723 1.185c5.464 0 9.91-4.39 9.91-9.781C22.12 6.39 17.674 2 12.21 2zm5.727 13.914c-.244.68-1.22 1.332-1.83 1.4-.61.07-1.373.13-3.832-.86-2.46-.99-4.04-3.46-4.162-3.62-.122-.17-1.012-1.33-1.012-2.53 0-1.2.634-1.8.854-2.03.22-.24.488-.3.653-.3.164 0 .33.01.47.01.147 0 .348-.06.543.4.195.47.67 1.61.73 1.73.061.12.1.26.02.42-.08.17-.183.28-.317.43-.134.15-.28.34-.4.48-.135.15-.275.31-.116.58.16.27.707 1.15 1.513 1.86.1.09.81.72 1.636 1.05.25.1.445.08.61-.09.214-.22.915-1.05 1.16-1.41.244-.36.488-.3.824-.18.335.12 2.122.99 2.488 1.17.366.18.61.27.695.41.085.15.085.86-.159 1.54z" />
      </svg>
    </a>
  );
}
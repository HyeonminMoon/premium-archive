"use client";

import { useEffect, useRef, useState } from "react";
import {
  loadTossPayments,
  type TossPaymentsWidgets,
} from "@tosspayments/tosspayments-sdk";

// 여기 붙는 코드는 브라우저에서 돌아간다. 그래서 여기서 하는 일은 딱 하나다 —
// 결제창을 띄워 카드 "인증"을 받는 것. 결제를 최종 확정하는 "승인"은
// 서버(app/membership/success/page.tsx)에서만 한다.
//
// 이 파일에는 비밀 키가 한 글자도 없어야 한다. 있으면 개발자도구에서 그대로 보인다.

// 월 구독료. 서버(success 페이지)에도 같은 값이 있고, 승인 전에 두 값을 대조한다.
const MONTHLY_PRICE = 9900;

// 구글 애널리틱스가 켜져 있으면 브라우저에 window.gtag 라는 함수가 생긴다.
// 타입스크립트에게 "그런 함수가 있을 수도 있다"고 알려 준다.
declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}

export default function PaymentWidget({
  clientKey,
  customerKey,
  customerEmail,
}: {
  // 토스 클라이언트 키. 서버 페이지가 읽어서 넘겨준다.
  // 공개돼도 되는 값이지만, 환경 변수 이름에 NEXT_PUBLIC_ 을 붙이지 않으려고
  // 브라우저가 직접 읽지 않고 이렇게 받는다.
  clientKey: string;
  customerKey: string;
  customerEmail: string;
}) {
  const widgetsRef = useRef<TossPaymentsWidgets | null>(null);
  const startedRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // 위젯은 화면에 한 번만 붙인다. 개발 모드에서 이 코드가 두 번 실행되는데,
    // 막지 않으면 결제수단 목록이 두 겹으로 그려진다.
    if (startedRef.current) return;
    startedRef.current = true;

    async function attachWidget() {
      const tossPayments = await loadTossPayments(clientKey);

      // customerKey: 이 고객이 누구인지 구분하는 값. 회원 id(UUID)를 쓴다.
      // 이메일이나 1,2,3 같은 순번은 쓰면 안 된다.
      const widgets = tossPayments.widgets({ customerKey });

      // 금액을 먼저 정해야 결제수단 목록을 그릴 수 있다.
      await widgets.setAmount({ currency: "KRW", value: MONTHLY_PRICE });

      await Promise.all([
        widgets.renderPaymentMethods({ selector: "#toss-payment-methods" }),
        widgets.renderAgreement({ selector: "#toss-agreement" }),
      ]);

      widgetsRef.current = widgets;
      setReady(true);
    }

    attachWidget().catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "결제창을 불러오지 못했습니다.");
    });
  }, [clientKey, customerKey]);

  async function startPayment() {
    const widgets = widgetsRef.current;
    if (!widgets) return;

    setError("");

    // 구글 애널리틱스에 버튼 클릭을 기록한다.
    // 로컬 개발 중에는 window.gtag 가 아예 없으므로 ?. 로 그냥 건너뛴다.
    // 기록이 실패해도 결제는 계속 진행되어야 하므로 try 바깥에 두지 않는다.
    window.gtag?.("event", "membership_start_click", {
      // 어느 페이지에서 눌렀는지
      page_path: window.location.pathname,
      page_location: window.location.href,
      // 무엇을 누른 건지
      button_name: "멤버십 시작하기",
      value: MONTHLY_PRICE,
      currency: "KRW",
    });

    try {
      // 결제창이 뜬다. 인증을 마치면 토스가 successUrl 로 되돌려 보내면서
      // paymentKey, orderId, amount 를 주소에 붙여 준다. 그 다음이 서버 승인이다.
      await widgets.requestPayment({
        orderId: crypto.randomUUID(), // 주문마다 새로 만든다 (6~64자)
        orderName: "프리미엄 아카이브 멤버십",
        customerEmail,
        successUrl: window.location.origin + "/membership/success",
        // 실패하면 이 화면으로 돌아온다. 토스가 code, message 를 주소에 붙여 준다.
        failUrl: window.location.origin + "/membership",
      });
    } catch (e: unknown) {
      // 사용자가 결제창을 그냥 닫은 경우도 여기로 온다.
      setError(e instanceof Error ? e.message : "결제를 시작하지 못했습니다.");
    }
  }

  return (
    <div className="mt-8 border-t border-line pt-6">
      {/* 토스가 이 두 칸 안에 결제수단 선택과 약관 동의 화면을 직접 그려 준다. */}
      <div id="toss-payment-methods" />
      <div id="toss-agreement" />

      {error && (
        <p className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-sm text-accent">
          {error}
        </p>
      )}

      <button
        type="button"
        onClick={startPayment}
        disabled={!ready}
        className="mt-6 w-full rounded-full bg-accent px-5 py-3.5 font-semibold text-white shadow-sm transition hover:opacity-90 disabled:bg-line disabled:text-muted disabled:shadow-none"
      >
        {ready ? "멤버십 시작하기" : "결제창 불러오는 중…"}
      </button>

      <p className="mt-3 text-center text-xs text-muted">
        테스트 모드입니다. 실제로 돈이 빠져나가지 않습니다.
      </p>
    </div>
  );
}

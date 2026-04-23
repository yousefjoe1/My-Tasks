import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    // 1. هنا بتجيب التوكن أو الكوكي بتاع المستخدم
    const token = request.cookies.get('auth-token')?.value;

    // 2. هنا المفروض تعمل "Decode" للتوكن عشان تعرف الـ Role
    // (لو بتستخدم NextAuth.js أو JWT، ممكن تستخدم المكتبة المناسبة هنا)
    const userRole = token ? 'admin' : 'user'; // ده مجرد مثال، استبدله بمنطق الـ Auth بتاعك

    // 3. منطق الـ "Proxy" الخاص بالصلاحيات
    const isAdmin = userRole === 'admin';

    // لو المستخدم مش أدمن وبيحاول يدخل مسار بيبدأ بـ /admin
    if (request.nextUrl.pathname.startsWith('/admin') && !isAdmin) {
        // هيروح للـ Home فوراً
        return NextResponse.redirect(new URL('/', request.url));
    }

    // لو أدمن أو داخل مسار عادي، كمل طبيعي
    return NextResponse.next();
}

// الـ Config ده بيحدد المسارات اللي الـ Proxy ده هيراقبها
export const config = {
    matcher: ['/admin/:path*'],
};
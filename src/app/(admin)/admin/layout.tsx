
export default async function AdminLayout({ children }: { children: React.ReactNode }) {

    return (
        <div className="admin-wrapper">
            {/* يمكنك وضع Sidebar خاص بالأدمن هنا */}
            <nav className="p-4 bg-gray-800">لوحة تحكم الأدمن</nav>
            <main>{children}</main>
        </div>
    );
}
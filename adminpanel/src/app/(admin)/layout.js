import Header from "@/components/header";
import Sidebar from "@/components/sidebar";


export default function DashboardLayout({ children }) {

    const mockUser = {
        name: 'Test User',
        email: 'test@example.com'
    };

    return (
        <div className="flex h-screen  overflow-hidden">
            <Sidebar className="bg-[#F0F5FB]" />
            <div className="flex flex-col flex-1 overflow-hidden">
                <Header user={mockUser} />
                <main className="flex-1 overflow-y-auto p-4 bg-[#F6F8FB]">
                    {children}
                </main>
            </div>
        </div>
    );
}

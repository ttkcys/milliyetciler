export default function AdminHome() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white">Admin Panel</h1>
        <p className="text-white/60 mt-2 text-lg">Yönetim ekranına hoş geldin.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Users */}
        <a
          href="/admin/users"
          className="group relative overflow-hidden rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 transition-all duration-300 hover:border-[#ffc451] hover:shadow-lg hover:shadow-[#ffc451]/20 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffc451]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/30 transition-transform duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-[#1a1a1a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Kullanıcılar</h3>
              <p className="text-white/60 text-sm">Kullanıcı yönetimi ve düzenleme</p>
            </div>

            <svg className="w-5 h-5 text-white/40 transition-all duration-300 group-hover:text-[#ffc451] group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        {/* Dergiler */}
        <a
          href="/admin/dergiler"
          className="group relative overflow-hidden rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 transition-all duration-300 hover:border-[#ffc451] hover:shadow-lg hover:shadow-[#ffc451]/20 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffc451]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/30 transition-transform duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-[#1a1a1a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Dergiler</h3>
              <p className="text-white/60 text-sm">Dergi ekleme ve düzenleme</p>
            </div>

            <svg className="w-5 h-5 text-white/40 transition-all duration-300 group-hover:text-[#ffc451] group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        {/* Sayılar */}
        <a
          href="/admin/sayilar"
          className="group relative overflow-hidden rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 transition-all duration-300 hover:border-[#ffc451] hover:shadow-lg hover:shadow-[#ffc451]/20 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffc451]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/30 transition-transform duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-[#1a1a1a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Sayılar</h3>
              <p className="text-white/60 text-sm">Dergi sayılarını yönet</p>
            </div>

            <svg className="w-5 h-5 text-white/40 transition-all duration-300 group-hover:text-[#ffc451] group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        {/* Yazılar */}
        <a
          href="/admin/yazilar"
          className="group relative overflow-hidden rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 transition-all duration-300 hover:border-[#ffc451] hover:shadow-lg hover:shadow-[#ffc451]/20 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffc451]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/30 transition-transform duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-[#1a1a1a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Yazılar</h3>
              <p className="text-white/60 text-sm">Yazı ekleme ve düzenleme</p>
            </div>

            <svg className="w-5 h-5 text-white/40 transition-all duration-300 group-hover:text-[#ffc451] group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

        {/* Yazarlar */}
        <a
          href="/admin/yazarlar"
          className="group relative overflow-hidden rounded-2xl border border-[#333] bg-gradient-to-br from-[#1a1a1a] to-[#0f0f0f] p-8 transition-all duration-300 hover:border-[#ffc451] hover:shadow-lg hover:shadow-[#ffc451]/20 hover:scale-[1.02]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#ffc451]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

          <div className="relative flex items-start gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-gradient-to-br from-[#ffc451] to-[#ffb020] shadow-lg shadow-[#ffc451]/30 transition-transform duration-300 group-hover:scale-110">
              <svg className="w-8 h-8 text-[#1a1a1a]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 14a4 4 0 10-8 0m12 0a8 8 0 11-16 0 8 8 0 0116 0z" />
              </svg>
            </div>

            <div className="flex-1">
              <h3 className="text-xl font-bold text-white mb-1">Yazarlar</h3>
              <p className="text-white/60 text-sm">Yazar ekleme ve düzenleme</p>
            </div>

            <svg className="w-5 h-5 text-white/40 transition-all duration-300 group-hover:text-[#ffc451] group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </a>

 

  
      </div>
    </div>
  );
}

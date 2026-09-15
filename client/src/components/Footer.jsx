const columns = [
  {
    title: 'Shop',
    items: ['New arrivals', 'Best sellers', 'Deals', 'Gift cards'],
  },
  {
    title: 'Help',
    items: ['Track order', 'Returns', 'Shipping', 'Contact us'],
  },
  {
    title: 'ShopKart',
    items: ['About', 'Sellers', 'Careers', 'Press'],
  },
]

export default function Footer() {
  return (
    <footer className="mt-auto bg-ink text-paper/78">
      <div className="wrap grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-8 py-16 max-[720px]:grid-cols-2 max-[720px]:py-12">
        <div className="max-[720px]:col-span-full max-[720px]:mb-2">
          <h3 className="font-display text-2xl text-paper mb-2.5">ShopKart</h3>
          <p className="max-w-[26ch] text-[14.5px] leading-relaxed">Everything you need, nothing you don't.</p>
        </div>

        {columns.map((col) => (
          <div key={col.title}>
            <span className="block text-[14.5px] font-bold text-paper mb-3.5">{col.title}</span>
            <ul className="flex list-none flex-col gap-2.5 p-0 m-0">
              {col.items.map((item) => (
                <li key={item}>
                  <a href="#" className="text-[14.5px] hover:text-marigold">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="wrap flex justify-between border-t border-paper/14 py-5 text-[13px] max-[720px]:flex-col max-[720px]:gap-1.5 max-[720px]:py-4.5">
        <span>© {new Date().getFullYear()} ShopKart</span>
        <span className="opacity-60">practice project — not a real store</span>
      </div>
    </footer>
  )
}

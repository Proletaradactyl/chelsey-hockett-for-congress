		const PRODUCTS = [
			{id:1,name:'Classic Tee',price:25,desc:'100% cotton unisex tee. Available S–XL.'},
			{id:2,name:'Campaign Cap',price:20,desc:'Adjustable cap with embroidered logo.'},
			{id:3,name:'Sticker Pack',price:6,desc:'Set of 5 high-quality stickers.'},
			{id:4,name:'Reusable Tote',price:18,desc:'Canvas tote with bold print.'}
		];

		const productsEl = document.getElementById('products');
		const cart = {};

		function renderProducts(){
			productsEl.innerHTML = '';
			PRODUCTS.forEach(p=>{
				const el = document.createElement('div'); el.className='card';
				el.innerHTML = `
					<div class="img">${p.name}</div>
					<h4 class="title">${p.name}</h4>
					<div class="price">$${p.price.toFixed(2)}</div>
					<div class="desc">${p.desc}</div>
					<div class="actions">
						<button onclick="addToCart(${p.id})">Add to cart</button>
						<button class="secondary" onclick="addToCart(${p.id},1)">Quick +1</button>
					</div>
				`;
				productsEl.appendChild(el);
			})
		}

		function updateCartDisplay(){
			const count = Object.values(cart).reduce((s,it)=>s+it.qty,0);
			const cartCount = document.getElementById('cartCount');
			if(count>0){cartCount.style.display='inline-block';cartCount.textContent=count}else cartCount.style.display='none';
			const itemsEl = document.getElementById('cartItems'); itemsEl.innerHTML='';
			let total=0;
			Object.values(cart).forEach(it=>{
				total += it.qty*it.price;
				const div = document.createElement('div'); div.className='cart-item';
				div.innerHTML = `<div style="flex:1"><strong>${it.name}</strong><div style="font-size:13px;color:#666">$${it.price.toFixed(2)} each</div></div><div class="qty">${it.qty}</div><div style="margin-left:8px">$${(it.qty*it.price).toFixed(2)}</div>`;
				itemsEl.appendChild(div);
			})
			document.getElementById('cartTotal').textContent = `$${total.toFixed(2)}`;
		}

		function addToCart(id,qty=1){
			const p = PRODUCTS.find(x=>x.id===id); if(!p) return;
			if(!cart[id]) cart[id]={...p,qty:0};
			cart[id].qty += qty;
			if(cart[id].qty<1) delete cart[id];
			updateCartDisplay();
		}

		document.getElementById('cartBtn').addEventListener('click',()=>{
			document.getElementById('cartPanel').classList.toggle('show');
		});
		document.getElementById('clearCart').addEventListener('click',()=>{for(const k in cart)delete cart[k];updateCartDisplay()});
		document.getElementById('checkout').addEventListener('click',()=>{alert('Checkout not implemented — contact merch@example.org to place an order.');});

		renderProducts(); updateCartDisplay();
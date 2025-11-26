import React, { useState, useEffect } from "react";
import BaseLayout from "../layouts/BaseLayout";
import { FaFilter } from "react-icons/fa";
import { useProducts } from "../hooks/useProducts";

export default function Accessories() {
  const title = "Accesorios";
  const { products, loading } = useProducts([
    "mice",
    "keyboards",
    "microphones",
    "headsets",
    "networking"
  ]);

  const [productos, setProductos] = useState([]);
  const [productosFiltrados, setProductosFiltrados] = useState([]);
  const [filtros, setFiltros] = useState({
    tipo: "",
    subcategoria: "",
    marca: "",
    maxPrecio: null,
  });
  const [precioMax, setPrecioMax] = useState(0);
  const [orden, setOrden] = useState("asc");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [cantidades, setCantidades] = useState({});

  // Función de carrito
  const addToCart = (producto) => {
    console.log("Añadiendo al carrito:", producto);
  };

  // Mapeo de productos
  useEffect(() => {
    if (!loading && products?.length > 0) {
      const mapped = products.map(p => {
        // Mapeo tipo
        let tipo = "";
        switch(p.categories?.name) {
          case "mice": tipo = "Mouse"; break;
          case "keyboards": tipo = "Teclado"; break;
          case "microphones": tipo = "Micrófono"; break;
          case "headsets": tipo = "Auriculares"; break;
          case "networking":
          case "Accessories": tipo = "Mousepad"; break; // Aquí mapeamos Accessories a Mousepad
          default: tipo = p.categories?.name || "";
        }
      
        // Marca
        const marcaMatch = p.name.match(/Logitech|Corsair|Blue|Razer|HyperX|Sony|Fifine|SteelSeries/);
        const marca = marcaMatch ? marcaMatch[0] : "";
      
        // Subcategoría
        let subcategoria = "";
        if(p.specs?.rgb) subcategoria = "RGB";
        else if(p.specs?.switch === "Mecánico") subcategoria = "Mecánico";
        else if(p.specs?.dpi) subcategoria = "Gaming";
        else if(p.subcategory) subcategoria = p.subcategory; // fallback para USB, Oficina, Membrana, Bluetooth
      
        return {
          ...p,
          tipo,
          marca,
          subcategoria,
          precio: p.price,
          imagen: p.image
        }
      });
      
      setProductos(mapped);

      const maxP = Math.max(...mapped.map(p => p.precio));
      setPrecioMax(maxP);
      setFiltros(prev => ({ ...prev, maxPrecio: maxP }));

      const initialCantidades = {};
      mapped.forEach(p => { initialCantidades[p.id] = 1; });
      setCantidades(initialCantidades);
    }
  }, [loading, products]);

  // Filtrar y ordenar
  useEffect(() => {
    let resultado = [...productos];
    if (filtros.tipo) resultado = resultado.filter(p => p.tipo.toLowerCase() === filtros.tipo.toLowerCase());
    if (filtros.subcategoria) resultado = resultado.filter(p => p.subcategoria.toLowerCase() === filtros.subcategoria.toLowerCase());
    if (filtros.marca) resultado = resultado.filter(p => p.marca.toLowerCase() === filtros.marca.toLowerCase());
    if (filtros.maxPrecio != null) resultado = resultado.filter(p => p.precio <= filtros.maxPrecio);
    resultado.sort((a, b) => orden === "asc" ? a.precio - b.precio : b.precio - a.precio);
    setProductosFiltrados(resultado);
  }, [filtros, orden, productos]);

  const limpiarFiltros = () => {
    setFiltros({ tipo: "", subcategoria: "", marca: "", maxPrecio: precioMax });
    setOrden("asc");
  };

  const toggleMobileFilters = () => setMobileFiltersOpen(!mobileFiltersOpen);
  const incrementar = (id) => setCantidades(prev => ({ ...prev, [id]: prev[id] + 1 }));
  const decrementar = (id) => setCantidades(prev => ({ ...prev, [id]: Math.max(1, prev[id]) }));

  // Formulario de filtros accesible
  const FiltrosForm = () => (
    <form>
      <fieldset className="mb-4">
        <legend className="font-semibold mb-2">Filtros de productos</legend>

        <label htmlFor="tipo">Tipo</label>
        <select
          id="tipo"
          name="tipo"
          value={filtros.tipo}
          onChange={e => setFiltros(prev => ({ ...prev, tipo: e.target.value }))}
          className="w-full mb-3 p-2 rounded bg-[var(--menu-bg)]"
        >
          <option value="">Todos</option>
          <option value="Mouse">Mouse</option>
          <option value="Teclado">Teclado</option>
          <option value="Micrófono">Micrófono</option>
          <option value="Auriculares">Auriculares</option>
          <option value="Mousepad">Mousepad</option>
        </select>

        <label htmlFor="subcategoria">Subcategoría</label>
        <select
          id="subcategoria"
          name="subcategoria"
          value={filtros.subcategoria}
          onChange={e => setFiltros(prev => ({ ...prev, subcategoria: e.target.value }))}
          className="w-full mb-3 p-2 rounded bg-[var(--menu-bg)]"
        >
          <option value="">Todos</option>
          <option value="Gaming">Gaming</option>
          <option value="Mecánico">Mecánico</option>
          <option value="RGB">RGB</option>
        </select>

        <label htmlFor="marca">Marca</label>
        <select
          id="marca"
          name="marca"
          value={filtros.marca}
          onChange={e => setFiltros(prev => ({ ...prev, marca: e.target.value }))}
          className="w-full mb-3 p-2 rounded bg-[var(--menu-bg)]"
        >
          <option value="">Todas</option>
          <option value="Logitech">Logitech</option>
          <option value="Corsair">Corsair</option>
          <option value="Blue">Blue</option>
          <option value="Razer">Razer</option>
          <option value="HyperX">HyperX</option>
          <option value="Sony">Sony</option>
          <option value="Fifine">Fifine</option>
        </select>

        <label htmlFor="precioMax">Precio máximo (S/.)</label>
        <input
          type="range"
          id="precioMax"
          name="precioMax"
          min="0"
          max={precioMax}
          value={filtros.maxPrecio || precioMax}
          onChange={e => setFiltros(prev => ({ ...prev, maxPrecio: Number(e.target.value) }))}
          className="w-full mb-2"
        />
        <div className="flex justify-between text-sm mb-4">
          <span>0</span>
          <span>{filtros.maxPrecio || precioMax}</span>
        </div>

        <button type="button" onClick={limpiarFiltros} className="w-full bg-gray-600 hover:brightness-110 text-white py-2 rounded">
          Limpiar filtros
        </button>
      </fieldset>
    </form>
  );

  if (loading && productos.length === 0) return (
    <BaseLayout title={title}>
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-gray-300 border-t-blue-600"></div>
      </div>
    </BaseLayout>
  );

  return (
    <BaseLayout title={title}>
      <section className="mt-16 px-6 border-b border-gray-500 pb-4 flex flex-col sm:flex-row justify-between gap-3">
        <h1 className="text-3xl md:text-4xl font-bold text-[var(--accent)]">{title}</h1>
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto text-[var(--text)]">
          <span className="text-sm">{productosFiltrados.length} Productos encontrados</span>
          <select
            value={orden}
            onChange={e => setOrden(e.target.value)}
            className="p-2 rounded bg-[var(--menu-bg)] text-sm w-full sm:w-auto"
          >
            <option value="asc">Precio: Menor a Mayor</option>
            <option value="desc">Precio: Mayor a Menor</option>
          </select>
        </div>
      </section>

      <main className="px-6 relative lg:flex lg:gap-8 mt-4">
        <aside className="lg:w-1/4 p-6 rounded-md bg-[var(--menu-bg)] shadow-lg overflow-auto hidden lg:block">
          {precioMax > 0 && <FiltrosForm />}
        </aside>

        <button onClick={toggleMobileFilters} className="fixed bottom-4 right-4 z-50 bg-indigo-600 hover:bg-indigo-700 p-4 rounded-full text-white shadow-lg lg:hidden">
          <FaFilter />
        </button>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end lg:hidden">
            <div className="bg-[var(--menu-bg)] w-3/4 max-w-xs p-6 overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Filtros</h2>
                <button onClick={toggleMobileFilters} className="text-gray-300 hover:text-white">✕</button>
              </div>
              <FiltrosForm />
            </div>
          </div>
        )}

        <section className="w-full lg:w-3/4 flex flex-col gap-4">
          {productosFiltrados.map(p => (
            <div key={p.id} className="producto flex flex-col sm:flex-row items-center border-b border-gray-600 p-4 hover:bg-[var(--menu-bg)] transition">
              <a href={`/products/${p.id}`} className="w-full sm:w-48 flex-shrink-0">
                <img src={p.imagen} alt={p.name} className="w-full h-32 object-cover rounded" />
              </a>
              <div className="flex-1 sm:ml-4 flex flex-col justify-between w-full mt-2 sm:mt-0">
                <div>
                  <h3 className="text-[var(--accent)] font-semibold text-lg">{p.name}</h3>
                  <ul className="text-[var(--text)] text-sm mt-2 space-y-1">
                    <li><strong>Tipo:</strong> {p.tipo}</li>
                    <li><strong>Subcategoría:</strong> {p.subcategoria}</li>
                    <li><strong>Marca:</strong> {p.marca}</li>
                  </ul>
                </div>
                <div className="mt-2 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
                  <span className="text-[var(--accent)] font-bold text-lg">S/. {p.precio}</span>
                  <div className="flex items-center gap-2">
                    <button aria-label="Disminuir cantidad" onClick={() => decrementar(p.id)} className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">-</button>
                    <span className="px-2">{cantidades[p.id]}</span>
                    <button aria-label="Incrementar cantidad" onClick={() => incrementar(p.id)} className="px-2 py-1 bg-gray-600 text-white rounded hover:bg-gray-700">+</button>
                  </div>
                  <button onClick={() => addToCart({
                    id: p.id,
                    nombre: p.name,
                    precio: p.precio,
                    cantidad: cantidades[p.id],
                    imagen: p.imagen,
                  })}
                  className="mt-3 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded shadow transition">
                    Agregar al carrito
                  </button>
                </div>
              </div>
            </div>
          ))}
        </section>
      </main>
    </BaseLayout>
  );
}

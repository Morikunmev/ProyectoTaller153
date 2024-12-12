import React from "react";

const Seccion = ({ titulo, contenido }) => (
  <div className="bg-white rounded-lg shadow p-6 mb-6">
    <h2
      className="text-xl font-bold mb-4 text-gray-900"
      id={titulo.toLowerCase().replace(/ /g, "-")}
    >
      {titulo}
    </h2>
    <div className="prose max-w-none">{contenido}</div>
  </div>
);

const ManualUsuario = () => {
  const userType = document
    .getElementById("react-manual")
    ?.getAttribute("data-user-type");
  const isColaborador = userType === "Colaborador";

  return (
    <main className="mt-16">
      <div className="flex">
        {/* Sidebar con índice */}
        <div className="w-64 bg-gray-50 p-6 min-h-screen sticky top-16">
          <h3 className="text-lg font-bold mb-4 text-gray-900">Índice:</h3>
          <ul className="space-y-2">
            <li>
              <a
                href="#navbar-superior"
                className="text-blue-600 hover:text-blue-800"
              >
                Navbar Superior
              </a>
            </li>
            {!isColaborador && (
              <li>
                <a
                  href="#gestor-proveedor"
                  className="text-blue-600 hover:text-blue-800"
                >
                  Gestor Proveedor
                </a>
              </li>
            )}
            <li>
              <a
                href="#gestor-material"
                className="text-blue-600 hover:text-blue-800"
              >
                Gestor Material
              </a>
            </li>
            <li>
              <a
                href="#gestor-venta"
                className="text-blue-600 hover:text-blue-800"
              >
                Gestor Venta
              </a>
            </li>
          </ul>
        </div>

        {/* Contenido principal */}
        <div className="flex-1 p-6">
          <h1 className="text-3xl font-bold mb-8 text-gray-900">
            Manual de Usuario
          </h1>

          {/* Navbar Superior */}
          <Seccion
            titulo="Navbar Superior"
            contenido={
              <div className="space-y-4">
                <div className="max-w-2xl w-full mb-4">
                  <img
                    src="/static/images/1.png"
                    alt="Navbar Superior"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>

                <div className="max-w-2xl w-full aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    className="w-full h-full"
                    src="https://www.youtube.com/embed/H0s6PbkJ114"
                    title="Explicación Navbar Superior"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg mt-4 max-w-2xl">
                  <p className="text-sm text-gray-600">
                    <strong>Nota:</strong> Este video muestra las
                    funcionalidades básicas de la barra de navegación superior,
                    el sistema de correos, la personalización del perfil y
                    cierre de sesion.
                  </p>
                </div>
              </div>
            }
          />

          {/* Gestor Proveedor */}
          {!isColaborador && (
            <Seccion
              titulo="Gestor Proveedor"
              contenido={
                <div className="space-y-4">
                  <div className="max-w-xl w-full mb-4">
                    <img
                      src="/static/images/GESTOR_PROVEEDOR.png"
                      alt="Vista General Gestor Proveedor"
                      className="w-full rounded-lg shadow-lg"
                    />
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold">Módulo Proveedor</h3>
                    <div className="space-y-2 mt-2">
                      <div className="max-w-xl w-full aspect-video rounded-lg overflow-hidden shadow-lg mt-4">
                        <iframe
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/BuZFBsyai6A"
                          title="Tutorial Módulo Proveedor"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <p className="mt-4 text-gray-600">
                        El Módulo de Proveedor permite gestionar todos los
                        proveedores del sistema. Podrás registrar nuevos
                        proveedores, gestionar su información de contacto, ver
                        el historial de transacciones, administrar datos
                        empresariales y actualizar la información de proveedores
                        existentes.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <p className="text-sm text-gray-600">
                      <strong>Nota:</strong> Estas funcionalidades solo están
                      disponibles para usuarios administradores.
                    </p>
                  </div>

                  <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold">Módulo Factura</h3>
                    <div className="space-y-2 mt-2">
                      <div className="max-w-xl w-full aspect-video rounded-lg overflow-hidden shadow-lg mt-4">
                        <iframe
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/KRtdgbw5YMA"
                          title="Tutorial Módulo Factura"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <p className="mt-4 text-gray-600">
                        El Módulo de Factura te permite gestionar todas las
                        facturas asociadas a los proveedores. Podrás crear
                        nuevas facturas, registrar pagos y montos, ver el
                        historial de facturas por proveedor, gestionar estados
                        de pago y generar reportes de facturación.
                      </p>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <p className="text-sm text-gray-600">
                      <strong>Nota:</strong> Estas funcionalidades solo están
                      disponibles para usuarios administradores.
                    </p>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Módulo Envío</h3>
                    <div className="space-y-2 mt-2">
                      <div className="max-w-xl w-full aspect-video rounded-lg overflow-hidden shadow-lg mt-4">
                        <iframe
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/zUtnxplaj7M"
                          title="Tutorial Módulo Envío"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <p className="mt-4 text-gray-600">
                        El Módulo de Envío permite gestionar todos los envíos de
                        materiales y herramientas. Podrás registrar nuevos
                        envíos de proveedores, marcar envíos como pendientes o
                        recibidos, visualizar el tiempo transcurrido desde la
                        solicitud, ver detalles como cantidad, precio y tipo de
                        envío, generar reportes en Excel y administrar el estado
                        de recepción de los productos.
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg mt-4">
                    <p className="text-sm text-gray-600">
                      <strong>Nota:</strong> Estas funcionalidades solo están
                      disponibles para usuarios administradores.
                    </p>
                  </div>
                </div>
              }
            />
          )}
          {/* Gestor Material */}
          <Seccion
            titulo="Gestor Material"
            contenido={
              <div className="space-y-4">
                {/* Imagen del Gestor Material */}
                <div className="max-w-xl w-full mb-4">
                  <img
                    src="/static/images/GESTOR_MATERIAL.png"
                    alt="Vista General Gestor Material"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>
                {!isColaborador && (
                  <>
                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold">Módulo Material</h3>
                      <div className="space-y-2 mt-2">
                        <div className="max-w-xl w-full aspect-video rounded-lg overflow-hidden shadow-lg mt-4">
                          <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/r_vjUHzhJvw"
                            title="Tutorial Módulo Material"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                        <p className="mt-4 text-gray-600">
                          El modulo de material corresponde a los materiales que
                          se tienen en inventario fisico, el cual son usados
                          para la produccion de los productos, para
                          posteriormente ponerse a la venta.
                          <br />
                          Este módulo se integra directamente con el Módulo
                          Producto, permitiendo especificar qué materiales se
                          utilizan en la fabricación de cada producto.
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Nota:</strong> Estas funcionalidades solo están
                        disponibles para usuarios administradores.
                      </p>
                    </div>

                    <div className="border-b pb-4">
                      <h3 className="text-lg font-semibold">
                        Módulo Herramienta
                      </h3>
                      <div className="space-y-2 mt-2">
                        <div className="max-w-xl w-full aspect-video rounded-lg overflow-hidden shadow-lg mt-4">
                          <iframe
                            className="w-full h-full"
                            src="https://www.youtube.com/embed/bvtUzV6hszs"
                            title="Tutorial Módulo Herramienta"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        </div>
                        <p className="mt-4 text-gray-600">
                          El modulo de herramienta corresponde a las
                          herramientas que se tienen en inventario fisico, el
                          cual son usados para la produccion de los productos,
                          para posteriormente ponerse a la venta.
                        </p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Nota:</strong> Estas funcionalidades solo están
                        disponibles para usuarios administradores.
                      </p>
                    </div>
                  </>
                )}

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold">Módulo Producto</h3>
                  <div className="space-y-2 mt-2">
                    <div className="max-w-xl w-full aspect-video rounded-lg overflow-hidden shadow-lg mt-4">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/uuBTSIWybAE"
                        title="Tutorial Módulo Producto"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p className="mt-4 text-gray-600">
                      El Módulo Producto gestiona el inventario completo de
                      productos fabricados. Permite controlar el stock inicial y
                      actual, precios unitarios, registrar ventas y pérdidas,
                      así como categorizar los productos. Incluye
                      funcionalidades como:
                      <br />
                      - Filtrado por estado de stock (Con Stock, Stock Bajo, Sin
                      Stock)
                      <br />
                      - Visualización detallada del valor del inventario
                      original y actual
                      <br />
                      - Sistema de búsqueda por nombre y categoría
                      <br />
                      - Vistas en lista y cuadrícula para mejor organización
                      <br />- Registro de productos vendidos y desechados -
                      Exportación de datos a Excel
                      <br />- Historial por fecha de creación
                    </p>
                  </div>
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold">Módulo Categoría</h3>
                  <div className="space-y-2 mt-2">
                    <div className="max-w-xl w-full aspect-video rounded-lg overflow-hidden shadow-lg mt-4">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/z19x6U60VFk"
                        title="Tutorial Módulo Categoría"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p className="mt-4 text-gray-600">
                      El Módulo Producto gestiona el inventario completo de
                      productos fabricados. Permite controlar el stock inicial y
                      actual, precios unitarios, registrar ventas y pérdidas,
                      así como categorizar los productos. Incluye
                      funcionalidades como:
                      <br />
                      - Filtrado por estado de stock (Con Stock, Stock Bajo, Sin
                      Stock) <br />
                      - Visualización detallada del valor del inventario
                      original y actual <br />
                      - Sistema de búsqueda por nombre y categoría <br />-
                      Vistas en lista y cuadrícula para mejor organización{" "}
                      <br />
                      - Registro de productos vendidos y desechados
                      <br />
                      - Exportación de datos a Excel
                      <br />
                      -Historial por fecha de creación
                    </p>
                  </div>
                </div>

                {!isColaborador && (
                  <div>
                    <h3 className="text-lg font-semibold">Módulo Pérdida</h3>
                    <div className="space-y-2 mt-2">
                      <div className="max-w-xl w-full aspect-video rounded-lg overflow-hidden shadow-lg mt-4">
                        <iframe
                          className="w-full h-full"
                          src="https://www.youtube.com/embed/fyz93VStaq8"
                          title="Tutorial Módulo Pérdida"
                          frameBorder="0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        ></iframe>
                      </div>
                      <p className="mt-4 text-gray-600">
                        El Módulo Pérdida gestiona el registro y seguimiento de
                        productos que han sido desechados o perdidos. Permite
                        mantener un control detallado de las pérdidas de
                        inventario. Incluye funcionalidades como:
                        <br />
                        - Seguimiento detallado por fecha y usuario que registra
                        la pérdida
                        <br />
                        - Cálculo automático del valor total de pérdidas
                        <br />
                        - Agrupación y visualización por productos afectados
                        <br />
                        - Sistema de búsqueda y filtrado avanzado
                        <br />
                        - Vistas personalizables en lista y cuadrícula
                        <br />
                        - Registro del motivo y descripción de cada pérdida
                        <br />
                        - Opción de restablecer registros en caso de errores
                        <br />
                        - Exportación de datos a Excel para análisis externos
                        <br />
                        - Sistema de modificación y actualización de registros
                        <br />- Historial completo de cambios y modificaciones
                      </p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-lg mt-4">
                      <p className="text-sm text-gray-600">
                        <strong>Nota:</strong> Estas funcionalidades solo están
                        disponibles para usuarios administradores.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            }
          />

          {/* Gestor Venta */}
          <Seccion
            titulo="Gestor Venta"
            contenido={
              <div className="space-y-4">
                {/* Imagen del Gestor Venta */}
                <div className="max-w-xl w-full mb-4">
                  <img
                    src="/static/images/GESTOR_VENTA.png"
                    alt="Vista General Gestor Venta"
                    className="w-full rounded-lg shadow-lg"
                  />
                </div>

                <div className="border-b pb-4">
                  <h3 className="text-lg font-semibold">Módulo Venta</h3>
                  <div className="space-y-2 mt-2">
                    <div className="max-w-xl w-full aspect-video rounded-lg overflow-hidden shadow-lg mt-4">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/tODxpgjuAf4"
                        title="Tutorial Módulo Venta"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p className="mt-4 text-gray-600">
                      El Módulo Venta gestiona todas las transacciones de venta
                      realizadas en el sistema, proporcionando un control
                      detallado del historial de ventas y el rendimiento
                      comercial. Incluye funcionalidades como:
                      <br />
                      - Registro detallado de ventas por producto y cliente
                      <br />
                      - Seguimiento de ventas por estado de cliente (Con
                      cliente, Sin cliente, Cliente eliminado)
                      <br />
                      - Cálculo automático de montos totales y cantidades
                      vendidas
                      <br />
                      - Sistema de búsqueda y filtrado avanzado por producto y
                      cliente
                      <br />
                      - Visualización de datos en formato lista y cuadrícula
                      <br />
                      - Agrupación de ventas por fecha con códigos de color
                      <br />
                      - Estadísticas detalladas de ventas por producto
                      <br />
                      - Exportación de datos a Excel para análisis externos
                      <br />
                      - Sistema de modificación y restauración de ventas
                      <br />- Registro del usuario que realizó la venta y fechas
                      de operación
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Módulo Cliente</h3>
                  <div className="space-y-2 mt-2">
                    <div className="max-w-xl w-full aspect-video rounded-lg overflow-hidden shadow-lg mt-4">
                      <iframe
                        className="w-full h-full"
                        src="https://www.youtube.com/embed/ApScZTILxnc"
                        title="Tutorial Módulo Cliente"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                    <p className="mt-4 text-gray-600">
                      El Módulo Cliente gestiona toda la información relacionada
                      con los clientes del negocio, permitiendo un seguimiento
                      detallado de su historial de compras y datos personales.
                      Incluye funcionalidades como:
                      <br />
                      - Registro y gestión de clientes particulares y empresas
                      <br />
                      - Seguimiento del historial de compras y montos totales
                      por cliente
                      <br />
                      - Sistema de búsqueda avanzada por nombre o RUT
                      <br />
                      - Vista estadística por cliente con total de compras y
                      montos
                      <br />
                      - Visualización en formato lista y cuadrícula con
                      agrupación por fechas
                      <br />
                      - Registro de información detallada (RUT, teléfono, tipo
                      de cliente, etc.)
                      <br />
                      - Control de fechas de registro y modificaciones
                      <br />
                      - Gestión de clientes empresariales y particulares
                      <br />
                      - Exportación de datos a Excel para análisis externos
                      <br />- Sistema completo de creación, edición y
                      eliminación de registros
                    </p>
                  </div>
                </div>
              </div>
            }
          />
        </div>
      </div>
    </main>
  );
};

export default ManualUsuario;

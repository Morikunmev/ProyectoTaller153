--
-- PostgreSQL database dump
--

-- Dumped from database version 16.4 (Debian 16.4-1.pgdg120+2)
-- Dumped by pg_dump version 16.4

-- Started on 2024-12-08 21:10:51

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- TOC entry 283 (class 1255 OID 16885)
-- Name: actualizar_dias_horas(); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.actualizar_dias_horas()
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE dashboard_envio 
    SET "DiasTranscurridos" = 
        EXTRACT(DAY FROM (CURRENT_TIMESTAMP - "HoraCreacion")) +
        EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - "HoraCreacion"))/24
    WHERE "EnvioRecibido" = FALSE;
END;
$$;


ALTER PROCEDURE public.actualizar_dias_horas() OWNER TO postgres;

--
-- TOC entry 284 (class 1255 OID 16886)
-- Name: actualizar_dias_minutos(); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.actualizar_dias_minutos()
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE dashboard_envio 
    SET "DiasTranscurridos" = 
        EXTRACT(DAY FROM (CURRENT_TIMESTAMP - "HoraCreacion")) +
        EXTRACT(HOUR FROM (CURRENT_TIMESTAMP - "HoraCreacion"))/24 +
        EXTRACT(MINUTE FROM (CURRENT_TIMESTAMP - "HoraCreacion"))/1440
    WHERE "EnvioRecibido" = FALSE;
END;
$$;


ALTER PROCEDURE public.actualizar_dias_minutos() OWNER TO postgres;

--
-- TOC entry 285 (class 1255 OID 16887)
-- Name: actualizar_dias_segundos(); Type: PROCEDURE; Schema: public; Owner: postgres
--

CREATE PROCEDURE public.actualizar_dias_segundos()
    LANGUAGE plpgsql
    AS $$
BEGIN
    UPDATE dashboard_envio 
    SET "DiasTranscurridos" = 
        EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - "HoraCreacion"))/86400
    WHERE "EnvioRecibido" = FALSE;
END;
$$;


ALTER PROCEDURE public.actualizar_dias_segundos() OWNER TO postgres;

--
-- TOC entry 282 (class 1255 OID 16890)
-- Name: obtener_tiempo_detallado(integer); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.obtener_tiempo_detallado(p_envio_id integer) RETURNS TABLE(dias integer, horas integer, minutos integer, segundos integer, texto_estado text)
    LANGUAGE plpgsql
    AS $$
DECLARE
    v_hora_creacion timestamp;
    v_esta_recibido boolean;
    v_diferencia interval;
    v_dias_transcurridos integer;
BEGIN
    -- Actualizar los días transcurridos usando los procedimientos
    CALL actualizar_dias_horas();
    CALL actualizar_dias_minutos();
    CALL actualizar_dias_segundos();
    
    -- Obtener la información del envío usando los nombres correctos de las columnas
    SELECT 
        "HoraCreacion",
        "EnvioRecibido",
        "DiasTranscurridos"
    INTO 
        v_hora_creacion,
        v_esta_recibido,
        v_dias_transcurridos
    FROM dashboard_envio
    WHERE id = p_envio_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Envío no encontrado';
    END IF;
    
    -- Calcular la diferencia
    IF v_esta_recibido THEN
        -- Si está recibido, usar los días transcurridos almacenados
        v_diferencia := (v_dias_transcurridos || ' days')::interval;
    ELSE
        -- Si no está recibido, calcular hasta el tiempo actual
        v_diferencia := CURRENT_TIMESTAMP - v_hora_creacion;
    END IF;
    
    -- Retornar los componentes de tiempo
    RETURN QUERY 
    SELECT 
        EXTRACT(DAY FROM v_diferencia)::integer,
        EXTRACT(HOUR FROM v_diferencia - (EXTRACT(DAY FROM v_diferencia) || ' days')::interval)::integer,
        EXTRACT(MINUTE FROM v_diferencia - (EXTRACT(DAY FROM v_diferencia) || ' days')::interval - (EXTRACT(HOUR FROM v_diferencia) || ' hours')::interval)::integer,
        FLOOR(EXTRACT(SECOND FROM v_diferencia - (EXTRACT(DAY FROM v_diferencia) || ' days')::interval - (EXTRACT(HOUR FROM v_diferencia) || ' hours')::interval - (EXTRACT(MINUTE FROM v_diferencia) || ' minutes')::interval))::integer,
        CASE 
            WHEN v_esta_recibido THEN NULL  -- Cambiado aquí para no mostrar texto cuando está recibido
            ELSE NULL
        END;
END;
$$;


ALTER FUNCTION public.obtener_tiempo_detallado(p_envio_id integer) OWNER TO postgres;

--
-- TOC entry 270 (class 1255 OID 16697)
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_updated_at_column() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 222 (class 1259 OID 16419)
-- Name: auth_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group (
    id integer NOT NULL,
    name character varying(150) NOT NULL
);


ALTER TABLE public.auth_group OWNER TO postgres;

--
-- TOC entry 221 (class 1259 OID 16418)
-- Name: auth_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 224 (class 1259 OID 16427)
-- Name: auth_group_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_group_permissions (
    id bigint NOT NULL,
    group_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_group_permissions OWNER TO postgres;

--
-- TOC entry 223 (class 1259 OID 16426)
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_group_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_group_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 220 (class 1259 OID 16413)
-- Name: auth_permission; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_permission (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    content_type_id integer NOT NULL,
    codename character varying(100) NOT NULL
);


ALTER TABLE public.auth_permission OWNER TO postgres;

--
-- TOC entry 219 (class 1259 OID 16412)
-- Name: auth_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_permission ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_permission_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 226 (class 1259 OID 16433)
-- Name: auth_user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user (
    id integer NOT NULL,
    password character varying(128) NOT NULL,
    last_login timestamp with time zone,
    is_superuser boolean NOT NULL,
    username character varying(150) NOT NULL,
    first_name character varying(150) NOT NULL,
    last_name character varying(150) NOT NULL,
    email character varying(254) NOT NULL,
    is_staff boolean NOT NULL,
    is_active boolean NOT NULL,
    date_joined timestamp with time zone NOT NULL
);


ALTER TABLE public.auth_user OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 16441)
-- Name: auth_user_groups; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_groups (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    group_id integer NOT NULL
);


ALTER TABLE public.auth_user_groups OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16440)
-- Name: auth_user_groups_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_user_groups ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_groups_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 225 (class 1259 OID 16432)
-- Name: auth_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_user ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 230 (class 1259 OID 16447)
-- Name: auth_user_user_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.auth_user_user_permissions (
    id bigint NOT NULL,
    user_id integer NOT NULL,
    permission_id integer NOT NULL
);


ALTER TABLE public.auth_user_user_permissions OWNER TO postgres;

--
-- TOC entry 229 (class 1259 OID 16446)
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.auth_user_user_permissions ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.auth_user_user_permissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 259 (class 1259 OID 16990)
-- Name: dashboard_categoria; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_categoria (
    id bigint NOT NULL,
    "NombreCategoria" character varying(100) NOT NULL,
    "DescripcionCategoria" text,
    "StockCategoria" integer NOT NULL,
    "FotoCategoria" character varying(255),
    "CantidadCategoriaPerdida" integer NOT NULL,
    "CantidadCategoriaVenta" integer NOT NULL,
    "TotalCategoriaPerdida" numeric(12,2) NOT NULL,
    "TotalCategoriaVenta" numeric(12,2) NOT NULL,
    CONSTRAINT "dashboard_categoria_CantidadCategoriaPerdida_check" CHECK (("CantidadCategoriaPerdida" >= 0)),
    CONSTRAINT "dashboard_categoria_CantidadCategoriaVenta_check" CHECK (("CantidadCategoriaVenta" >= 0)),
    CONSTRAINT "dashboard_categoria_StockCategoria_check" CHECK (("StockCategoria" >= 0))
);


ALTER TABLE public.dashboard_categoria OWNER TO postgres;

--
-- TOC entry 258 (class 1259 OID 16989)
-- Name: dashboard_categoria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dashboard_categoria ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dashboard_categoria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 261 (class 1259 OID 17001)
-- Name: dashboard_cliente; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_cliente (
    id bigint NOT NULL,
    "ApellidoCliente" character varying(100) NOT NULL,
    "ComentarioCliente" text,
    "FechaCliente" date NOT NULL,
    "FechaRegistro" timestamp with time zone NOT NULL,
    "NombreCliente" character varying(100) NOT NULL,
    "NombreCompañia" character varying(100),
    "RutCliente" character varying(12) NOT NULL,
    "TelefonoCliente" character varying(15),
    "TipoCliente" character varying(20) NOT NULL,
    "UltimaModificacion" timestamp with time zone NOT NULL,
    "Usuario_id" integer,
    "CantidadTotalCompras" integer NOT NULL,
    "TotalDineroCompras" numeric(12,2) NOT NULL,
    CONSTRAINT "dashboard_cliente_CantidadTotalCompras_check" CHECK (("CantidadTotalCompras" >= 0))
);


ALTER TABLE public.dashboard_cliente OWNER TO postgres;

--
-- TOC entry 260 (class 1259 OID 17000)
-- Name: dashboard_cliente_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dashboard_cliente ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dashboard_cliente_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 253 (class 1259 OID 16852)
-- Name: dashboard_envio; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_envio (
    id integer NOT NULL,
    "NombreEnvio" character varying(100) NOT NULL,
    "CantidadEnvio" integer NOT NULL,
    "PrecioEnvio" numeric(10,2) NOT NULL,
    "TotalEnvio" numeric(10,2) NOT NULL,
    "TipoEnvio" character varying(50) NOT NULL,
    "FechaCompraEnvio" date NOT NULL,
    "EnvioRecibido" boolean NOT NULL,
    "DescripcionEnvio" text,
    "FotoEnvio" character varying(255),
    "Proveedor_id" bigint NOT NULL,
    "DiasTranscurridos" integer NOT NULL,
    "HoraCreacion" timestamp with time zone NOT NULL,
    "Factura_id" bigint,
    CONSTRAINT "dashboard_envio_CantidadEnvio_check" CHECK (("CantidadEnvio" >= 0))
);


ALTER TABLE public.dashboard_envio OWNER TO postgres;

--
-- TOC entry 252 (class 1259 OID 16851)
-- Name: dashboard_envio_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dashboard_envio ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dashboard_envio_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 251 (class 1259 OID 16840)
-- Name: dashboard_factura; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_factura (
    id bigint NOT NULL,
    "FechaEmision" date NOT NULL,
    "FotoFactura" character varying(255),
    "Proveedor_id" bigint NOT NULL,
    "DocumentoFactura" character varying(255),
    documento_asset_id character varying(255),
    "NumeroFactura" character varying(50) NOT NULL
);


ALTER TABLE public.dashboard_factura OWNER TO postgres;

--
-- TOC entry 250 (class 1259 OID 16839)
-- Name: dashboard_factura_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dashboard_factura ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dashboard_factura_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 255 (class 1259 OID 16904)
-- Name: dashboard_herramienta; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_herramienta (
    id bigint NOT NULL,
    "NombreHerramienta" character varying(100) NOT NULL,
    "StockHerramienta" integer NOT NULL,
    "PrecioHerramienta" numeric(10,2) NOT NULL,
    "TotalHerramienta" numeric(10,2) NOT NULL,
    "FechaCompraHerramienta" date NOT NULL,
    "MarcaHerramienta" character varying(100),
    "ModeloHerramienta" character varying(100),
    "UbicacionHerramienta" character varying(100),
    "FotoHerramienta" character varying(255),
    "Envio_id" integer,
    "DescripcionHerramienta" text,
    "RegistroFacturaHerramienta" character varying(2) NOT NULL,
    "Proveedor_id" bigint,
    CONSTRAINT "dashboard_herramienta_StockHerramienta_check" CHECK (("StockHerramienta" >= 0))
);


ALTER TABLE public.dashboard_herramienta OWNER TO postgres;

--
-- TOC entry 254 (class 1259 OID 16903)
-- Name: dashboard_herramienta_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dashboard_herramienta ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dashboard_herramienta_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 257 (class 1259 OID 16913)
-- Name: dashboard_material; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_material (
    id bigint NOT NULL,
    "NombreMaterial" character varying(100) NOT NULL,
    "StockMaterial" integer NOT NULL,
    "PrecioMaterial" numeric(10,2) NOT NULL,
    "TotalMaterial" numeric(10,2) NOT NULL,
    "FechaCompraMaterial" date NOT NULL,
    "DescripcionMaterial" text,
    "ColorMaterial" character varying(50),
    "PesoMaterial" character varying(50),
    "DimensionesMaterial" character varying(100),
    "DetalleMaterial" text,
    "EstadoMaterial" character varying(50),
    "UbicacionMaterial" character varying(100),
    "FotoMaterial" character varying(255),
    "Envio_id" integer,
    "RegistroFacturaMaterial" character varying(2) NOT NULL,
    "Proveedor_id" bigint,
    "StockOriginal" integer NOT NULL,
    CONSTRAINT "dashboard_material_StockMaterial_check" CHECK (("StockMaterial" >= 0)),
    CONSTRAINT "dashboard_material_StockOriginal_check" CHECK (("StockOriginal" >= 0))
);


ALTER TABLE public.dashboard_material OWNER TO postgres;

--
-- TOC entry 256 (class 1259 OID 16912)
-- Name: dashboard_material_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dashboard_material ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dashboard_material_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 269 (class 1259 OID 17103)
-- Name: dashboard_perdidas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_perdidas (
    id bigint NOT NULL,
    "NombrePerdida" character varying(100) NOT NULL,
    "CantidadPerdida" integer NOT NULL,
    "ValorUnitarioPerdida" numeric(10,2) NOT NULL,
    "ValorTotalPerdida" numeric(10,2) NOT NULL,
    "FechaPerdida" date NOT NULL,
    "MotivoPerdida" character varying(20) NOT NULL,
    "DescripcionPerdida" text,
    "FechaRegistro" timestamp with time zone NOT NULL,
    "UltimaModificacion" timestamp with time zone NOT NULL,
    "Producto_id" bigint NOT NULL,
    "Usuario_id" integer,
    CONSTRAINT "dashboard_perdidas_CantidadPerdida_check" CHECK (("CantidadPerdida" >= 0))
);


ALTER TABLE public.dashboard_perdidas OWNER TO postgres;

--
-- TOC entry 268 (class 1259 OID 17102)
-- Name: dashboard_perdidas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dashboard_perdidas ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dashboard_perdidas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 263 (class 1259 OID 17011)
-- Name: dashboard_producto; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_producto (
    id bigint NOT NULL,
    "NombreProducto" character varying(100) NOT NULL,
    "PrecioUnitarioProducto" numeric(10,2) NOT NULL,
    "PrecioTotalProducto" numeric(10,2) NOT NULL,
    "CantidadProductoVendido" integer NOT NULL,
    "CantidadProductoDesechado" integer NOT NULL,
    "DescripcionProducto" text,
    "UbicacionProducto" character varying(100),
    "EstadoProducto" character varying(50),
    "FechaProducto" date NOT NULL,
    "DiasProducto" integer NOT NULL,
    "ProductoAgotado" boolean NOT NULL,
    "HoraCreacion" timestamp with time zone NOT NULL,
    "FotoProducto" character varying(255),
    "Categoria_id" bigint,
    "StockProductoActual" integer NOT NULL,
    "StockProductoInicial" integer NOT NULL,
    CONSTRAINT "dashboard_producto_CantidadProductoDesechado_check" CHECK (("CantidadProductoDesechado" >= 0)),
    CONSTRAINT "dashboard_producto_CantidadProductoVendido_check" CHECK (("CantidadProductoVendido" >= 0)),
    CONSTRAINT "dashboard_producto_StockProductoActual_check" CHECK (("StockProductoActual" >= 0)),
    CONSTRAINT "dashboard_producto_StockProductoInicial_check" CHECK (("StockProductoInicial" >= 0))
);


ALTER TABLE public.dashboard_producto OWNER TO postgres;

--
-- TOC entry 262 (class 1259 OID 17010)
-- Name: dashboard_producto_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dashboard_producto ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dashboard_producto_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 267 (class 1259 OID 17067)
-- Name: dashboard_productomaterial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_productomaterial (
    id bigint NOT NULL,
    "CantidadUsada" integer NOT NULL,
    "DescripcionUso" text,
    "FechaRegistro" timestamp with time zone NOT NULL,
    "UltimaModificacion" timestamp with time zone NOT NULL,
    "Material_id" bigint NOT NULL,
    "Producto_id" bigint NOT NULL,
    CONSTRAINT "dashboard_productomaterial_CantidadUsada_check" CHECK (("CantidadUsada" >= 0))
);


ALTER TABLE public.dashboard_productomaterial OWNER TO postgres;

--
-- TOC entry 266 (class 1259 OID 17066)
-- Name: dashboard_productomaterial_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dashboard_productomaterial ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dashboard_productomaterial_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 249 (class 1259 OID 16823)
-- Name: dashboard_proveedor; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_proveedor (
    id bigint NOT NULL,
    "NombreProveedor" character varying(100) NOT NULL,
    "RutProveedor" character varying(12) NOT NULL,
    "MarcaProveedor" character varying(100) NOT NULL,
    "ComentarioProveedor" text,
    "CiudadProveedor" character varying(100),
    "RegionProveedor" character varying(100),
    "PaisProveedor" character varying(100),
    "TelefonoProveedor" character varying(15),
    "FotoProveedor" character varying(255),
    "FechaCreacionProveedor" timestamp with time zone NOT NULL,
    "FechaModificacionProveedor" timestamp with time zone NOT NULL
);


ALTER TABLE public.dashboard_proveedor OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 16822)
-- Name: dashboard_proveedor_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dashboard_proveedor ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dashboard_proveedor_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 265 (class 1259 OID 17022)
-- Name: dashboard_ventas; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.dashboard_ventas (
    id bigint NOT NULL,
    "NombreVenta" character varying(100) NOT NULL,
    "CantidadVenta" integer NOT NULL,
    "PrecioVenta" numeric(10,2) NOT NULL,
    "PrecioTotalVenta" numeric(10,2) NOT NULL,
    "FechaVenta" date NOT NULL,
    "FechaRegistro" timestamp with time zone NOT NULL,
    "Producto_id" bigint NOT NULL,
    "Usuario_id" integer,
    cliente_id bigint,
    cliente_eliminado boolean NOT NULL,
    CONSTRAINT "dashboard_ventas_CantidadVenta_check" CHECK (("CantidadVenta" >= 0))
);


ALTER TABLE public.dashboard_ventas OWNER TO postgres;

--
-- TOC entry 264 (class 1259 OID 17021)
-- Name: dashboard_ventas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.dashboard_ventas ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.dashboard_ventas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 232 (class 1259 OID 16505)
-- Name: django_admin_log; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_admin_log (
    id integer NOT NULL,
    action_time timestamp with time zone NOT NULL,
    object_id text,
    object_repr character varying(200) NOT NULL,
    action_flag smallint NOT NULL,
    change_message text NOT NULL,
    content_type_id integer,
    user_id integer NOT NULL,
    CONSTRAINT django_admin_log_action_flag_check CHECK ((action_flag >= 0))
);


ALTER TABLE public.django_admin_log OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 16504)
-- Name: django_admin_log_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_admin_log ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_admin_log_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 218 (class 1259 OID 16405)
-- Name: django_content_type; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_content_type (
    id integer NOT NULL,
    app_label character varying(100) NOT NULL,
    model character varying(100) NOT NULL
);


ALTER TABLE public.django_content_type OWNER TO postgres;

--
-- TOC entry 217 (class 1259 OID 16404)
-- Name: django_content_type_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_content_type ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_content_type_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 216 (class 1259 OID 16397)
-- Name: django_migrations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_migrations (
    id bigint NOT NULL,
    app character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    applied timestamp with time zone NOT NULL
);


ALTER TABLE public.django_migrations OWNER TO postgres;

--
-- TOC entry 215 (class 1259 OID 16396)
-- Name: django_migrations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.django_migrations ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.django_migrations_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 233 (class 1259 OID 16533)
-- Name: django_session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.django_session (
    session_key character varying(40) NOT NULL,
    session_data text NOT NULL,
    expire_date timestamp with time zone NOT NULL
);


ALTER TABLE public.django_session OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 16700)
-- Name: login_tokenrecuperacion; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_tokenrecuperacion (
    id bigint NOT NULL,
    token character varying(100) NOT NULL,
    created_at timestamp with time zone NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    used boolean NOT NULL,
    user_id integer NOT NULL
);


ALTER TABLE public.login_tokenrecuperacion OWNER TO postgres;

--
-- TOC entry 244 (class 1259 OID 16699)
-- Name: login_tokenrecuperacion_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.login_tokenrecuperacion ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.login_tokenrecuperacion_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 247 (class 1259 OID 16771)
-- Name: login_usuario; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_usuario (
    id bigint NOT NULL,
    "RutUsuario" character varying(12) NOT NULL,
    "TipoUsuario" character varying(20) NOT NULL,
    "EdadUsuario" integer,
    "TelefonoUsuario" character varying(15),
    "FotoUsuario" character varying(255),
    user_id integer NOT NULL,
    CONSTRAINT "login_usuario_EdadUsuario_check" CHECK (("EdadUsuario" >= 0))
);


ALTER TABLE public.login_usuario OWNER TO postgres;

--
-- TOC entry 246 (class 1259 OID 16770)
-- Name: login_usuario_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.login_usuario ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.login_usuario_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 235 (class 1259 OID 16552)
-- Name: social_auth_association; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_auth_association (
    id bigint NOT NULL,
    server_url character varying(255) NOT NULL,
    handle character varying(255) NOT NULL,
    secret character varying(255) NOT NULL,
    issued integer NOT NULL,
    lifetime integer NOT NULL,
    assoc_type character varying(64) NOT NULL
);


ALTER TABLE public.social_auth_association OWNER TO postgres;

--
-- TOC entry 234 (class 1259 OID 16551)
-- Name: social_auth_association_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.social_auth_association ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.social_auth_association_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 237 (class 1259 OID 16560)
-- Name: social_auth_code; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_auth_code (
    id bigint NOT NULL,
    email character varying(254) NOT NULL,
    code character varying(32) NOT NULL,
    verified boolean NOT NULL,
    "timestamp" timestamp with time zone NOT NULL
);


ALTER TABLE public.social_auth_code OWNER TO postgres;

--
-- TOC entry 236 (class 1259 OID 16559)
-- Name: social_auth_code_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.social_auth_code ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.social_auth_code_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 239 (class 1259 OID 16566)
-- Name: social_auth_nonce; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_auth_nonce (
    id bigint NOT NULL,
    server_url character varying(255) NOT NULL,
    "timestamp" integer NOT NULL,
    salt character varying(65) NOT NULL
);


ALTER TABLE public.social_auth_nonce OWNER TO postgres;

--
-- TOC entry 238 (class 1259 OID 16565)
-- Name: social_auth_nonce_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.social_auth_nonce ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.social_auth_nonce_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 243 (class 1259 OID 16598)
-- Name: social_auth_partial; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_auth_partial (
    id bigint NOT NULL,
    token character varying(32) NOT NULL,
    next_step smallint NOT NULL,
    backend character varying(32) NOT NULL,
    "timestamp" timestamp with time zone NOT NULL,
    data jsonb NOT NULL,
    CONSTRAINT social_auth_partial_next_step_check CHECK ((next_step >= 0))
);


ALTER TABLE public.social_auth_partial OWNER TO postgres;

--
-- TOC entry 242 (class 1259 OID 16597)
-- Name: social_auth_partial_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.social_auth_partial ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.social_auth_partial_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 241 (class 1259 OID 16572)
-- Name: social_auth_usersocialauth; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.social_auth_usersocialauth (
    id bigint NOT NULL,
    provider character varying(32) NOT NULL,
    uid character varying(255) NOT NULL,
    user_id integer NOT NULL,
    created timestamp with time zone NOT NULL,
    modified timestamp with time zone NOT NULL,
    extra_data jsonb NOT NULL
);


ALTER TABLE public.social_auth_usersocialauth OWNER TO postgres;

--
-- TOC entry 240 (class 1259 OID 16571)
-- Name: social_auth_usersocialauth_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

ALTER TABLE public.social_auth_usersocialauth ALTER COLUMN id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.social_auth_usersocialauth_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- TOC entry 3677 (class 0 OID 16419)
-- Dependencies: 222
-- Data for Name: auth_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group (id, name) FROM stdin;
\.


--
-- TOC entry 3679 (class 0 OID 16427)
-- Dependencies: 224
-- Data for Name: auth_group_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_group_permissions (id, group_id, permission_id) FROM stdin;
\.


--
-- TOC entry 3675 (class 0 OID 16413)
-- Dependencies: 220
-- Data for Name: auth_permission; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_permission (id, name, content_type_id, codename) FROM stdin;
1	Can add log entry	1	add_logentry
2	Can change log entry	1	change_logentry
3	Can delete log entry	1	delete_logentry
4	Can view log entry	1	view_logentry
5	Can add permission	2	add_permission
6	Can change permission	2	change_permission
7	Can delete permission	2	delete_permission
8	Can view permission	2	view_permission
9	Can add group	3	add_group
10	Can change group	3	change_group
11	Can delete group	3	delete_group
12	Can view group	3	view_group
13	Can add user	4	add_user
14	Can change user	4	change_user
15	Can delete user	4	delete_user
16	Can view user	4	view_user
17	Can add content type	5	add_contenttype
18	Can change content type	5	change_contenttype
19	Can delete content type	5	delete_contenttype
20	Can view content type	5	view_contenttype
21	Can add session	6	add_session
22	Can change session	6	change_session
23	Can delete session	6	delete_session
24	Can view session	6	view_session
25	Can add producto	7	add_producto
26	Can change producto	7	change_producto
27	Can delete producto	7	delete_producto
28	Can view producto	7	view_producto
29	Can add association	8	add_association
30	Can change association	8	change_association
31	Can delete association	8	delete_association
32	Can view association	8	view_association
33	Can add code	9	add_code
34	Can change code	9	change_code
35	Can delete code	9	delete_code
36	Can view code	9	view_code
37	Can add nonce	10	add_nonce
38	Can change nonce	10	change_nonce
39	Can delete nonce	10	delete_nonce
40	Can view nonce	10	view_nonce
41	Can add user social auth	11	add_usersocialauth
42	Can change user social auth	11	change_usersocialauth
43	Can delete user social auth	11	delete_usersocialauth
44	Can view user social auth	11	view_usersocialauth
45	Can add partial	12	add_partial
46	Can change partial	12	change_partial
47	Can delete partial	12	delete_partial
48	Can view partial	12	view_partial
49	Can add categoria	13	add_categoria
50	Can change categoria	13	change_categoria
51	Can delete categoria	13	delete_categoria
52	Can view categoria	13	view_categoria
53	Can add token recuperacion	14	add_tokenrecuperacion
54	Can change token recuperacion	14	change_tokenrecuperacion
55	Can delete token recuperacion	14	delete_tokenrecuperacion
56	Can view token recuperacion	14	view_tokenrecuperacion
57	Can add user	15	add_usuario
58	Can change user	15	change_usuario
59	Can delete user	15	delete_usuario
60	Can view user	15	view_usuario
61	Can add hola	16	add_hola
62	Can change hola	16	change_hola
63	Can delete hola	16	delete_hola
64	Can view hola	16	view_hola
65	Can add catalogo	17	add_catalogo
66	Can change catalogo	17	change_catalogo
67	Can delete catalogo	17	delete_catalogo
68	Can view catalogo	17	view_catalogo
69	Can add catalogoeee	18	add_catalogoeee
70	Can change catalogoeee	18	change_catalogoeee
71	Can delete catalogoeee	18	delete_catalogoeee
72	Can view catalogoeee	18	view_catalogoeee
73	Can add nose	19	add_nose
74	Can change nose	19	change_nose
75	Can delete nose	19	delete_nose
76	Can view nose	19	view_nose
77	Can add servicio	20	add_servicio
78	Can change servicio	20	change_servicio
79	Can delete servicio	20	delete_servicio
80	Can view servicio	20	view_servicio
81	Can add password reset token	21	add_passwordresettoken
82	Can change password reset token	21	change_passwordresettoken
83	Can delete password reset token	21	delete_passwordresettoken
84	Can view password reset token	21	view_passwordresettoken
85	Can add Proveedor	22	add_proveedor
86	Can change Proveedor	22	change_proveedor
87	Can delete Proveedor	22	delete_proveedor
88	Can view Proveedor	22	view_proveedor
89	Can add Factura	23	add_factura
90	Can change Factura	23	change_factura
91	Can delete Factura	23	delete_factura
92	Can view Factura	23	view_factura
93	Can add Envío	24	add_envio
94	Can change Envío	24	change_envio
95	Can delete Envío	24	delete_envio
96	Can view Envío	24	view_envio
97	Can add herramienta	25	add_herramienta
98	Can change herramienta	25	change_herramienta
99	Can delete herramienta	25	delete_herramienta
100	Can view herramienta	25	view_herramienta
101	Can add material	26	add_material
102	Can change material	26	change_material
103	Can delete material	26	delete_material
104	Can view material	26	view_material
105	Can add Venta	27	add_ventas
106	Can change Venta	27	change_ventas
107	Can delete Venta	27	delete_ventas
108	Can view Venta	27	view_ventas
109	Can add Cliente	28	add_cliente
110	Can change Cliente	28	change_cliente
111	Can delete Cliente	28	delete_cliente
112	Can view Cliente	28	view_cliente
113	Can add Material del Producto	29	add_productomaterial
114	Can change Material del Producto	29	change_productomaterial
115	Can delete Material del Producto	29	delete_productomaterial
116	Can view Material del Producto	29	view_productomaterial
117	Can add Pérdida	30	add_perdidas
118	Can change Pérdida	30	change_perdidas
119	Can delete Pérdida	30	delete_perdidas
120	Can view Pérdida	30	view_perdidas
\.


--
-- TOC entry 3681 (class 0 OID 16433)
-- Dependencies: 226
-- Data for Name: auth_user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user (id, password, last_login, is_superuser, username, first_name, last_name, email, is_staff, is_active, date_joined) FROM stdin;
15	pbkdf2_sha256$870000$KYMhyzfIewmZh9nQqT9uqP$rRLClGmDFX9Fy1IYwYtkp5bBd5f1HGuXZgs7b1EzEJc=	2024-12-08 05:29:25.806807+00	f	JuanPerez			juan.perez@gmail.com	f	t	2024-12-08 04:44:44.294812+00
17	pbkdf2_sha256$870000$SjS8p46Hu73O3eihHwwsl5$vaq4NK6W0DoLYBS0yHr2eyGVKnSvoPM6OQjnlzKKNco=	2024-12-08 18:55:35.180292+00	f	MariaLopez			MariaLopez@gmail.com	f	t	2024-12-08 05:12:10.157937+00
1	pbkdf2_sha256$870000$uS0tlnyxkGK4DKdvQ08yrA$rP42xMCp1gD0nBSMFQa9jSVAeP5IYGrSWeNUxWmEI7M=	2024-12-08 22:34:50.861527+00	t	richard	Richard	Rocuant	ricky201325@gmail.com	t	t	2024-10-25 08:00:06+00
\.


--
-- TOC entry 3683 (class 0 OID 16441)
-- Dependencies: 228
-- Data for Name: auth_user_groups; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_groups (id, user_id, group_id) FROM stdin;
\.


--
-- TOC entry 3685 (class 0 OID 16447)
-- Dependencies: 230
-- Data for Name: auth_user_user_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.auth_user_user_permissions (id, user_id, permission_id) FROM stdin;
\.


--
-- TOC entry 3714 (class 0 OID 16990)
-- Dependencies: 259
-- Data for Name: dashboard_categoria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_categoria (id, "NombreCategoria", "DescripcionCategoria", "StockCategoria", "FotoCategoria", "CantidadCategoriaPerdida", "CantidadCategoriaVenta", "TotalCategoriaPerdida", "TotalCategoriaVenta") FROM stdin;
6	Cuadro		0	image/upload/v1733205444/categorias/t29bn9vaebb7k1w6ockk.jpg	1	4	5.00	20015.00
5	Mesa		0	image/upload/v1733205373/categorias/a2zugeazajoblrsa2ycn.webp	0	0	0.00	0.00
\.


--
-- TOC entry 3716 (class 0 OID 17001)
-- Dependencies: 261
-- Data for Name: dashboard_cliente; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_cliente (id, "ApellidoCliente", "ComentarioCliente", "FechaCliente", "FechaRegistro", "NombreCliente", "NombreCompañia", "RutCliente", "TelefonoCliente", "TipoCliente", "UltimaModificacion", "Usuario_id", "CantidadTotalCompras", "TotalDineroCompras") FROM stdin;
10	rocuant	\N	2024-12-06	2024-12-06 06:52:29.672965+00	richard		19.662.924-6		particular	2024-12-08 04:21:44.849871+00	1	0	0.00
12	coca cola	nada	2024-12-08	2024-12-08 04:41:37.030199+00	Coca cola	Coca cola	93.281.000-K	+56992319557	empresa	2024-12-08 04:41:37.030199+00	\N	0	0.00
\.


--
-- TOC entry 3708 (class 0 OID 16852)
-- Dependencies: 253
-- Data for Name: dashboard_envio; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_envio (id, "NombreEnvio", "CantidadEnvio", "PrecioEnvio", "TotalEnvio", "TipoEnvio", "FechaCompraEnvio", "EnvioRecibido", "DescripcionEnvio", "FotoEnvio", "Proveedor_id", "DiasTranscurridos", "HoraCreacion", "Factura_id") FROM stdin;
27	Prueba de envio	200	1000.00	200000.00	material	2024-11-22	t	\N	image/upload/v1732313112/envios/frxxhibmkafsb5d2wg0d.jpg	67	4	2024-11-22 21:59:02.999739+00	48
29	Compra de madera	2	1000.00	2000.00	material	2024-11-26	t	\N	\N	67	1	2024-11-26 21:48:43.316409+00	50
\.


--
-- TOC entry 3706 (class 0 OID 16840)
-- Dependencies: 251
-- Data for Name: dashboard_factura; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_factura (id, "FechaEmision", "FotoFactura", "Proveedor_id", "DocumentoFactura", documento_asset_id, "NumeroFactura") FROM stdin;
47	2024-11-16	image/upload/v1731774286/facturas/h5dcymwao4lup4tbm6pz.webp	67	raw/upload/http://res.cloudinary.com/dfqlvd3d4/raw/upload/v1731774285/facturas/documentos/factura_doc_20241116_132443.pdf	71480c1b41ac1e1daa37b13b7b7d0da9	112233
48	2024-11-16	image/upload/v1731774311/facturas/gko4jofjb3p6uosy3yfw.pdf	67	raw/upload/http://res.cloudinary.com/dfqlvd3d4/raw/upload/v1731774310/facturas/documentos/factura_doc_20241116_132509.pdf	958b826fb499b32391213b7af4466ec4	22222
50	2024-11-26	\N	67	\N	\N	7
\.


--
-- TOC entry 3710 (class 0 OID 16904)
-- Dependencies: 255
-- Data for Name: dashboard_herramienta; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_herramienta (id, "NombreHerramienta", "StockHerramienta", "PrecioHerramienta", "TotalHerramienta", "FechaCompraHerramienta", "MarcaHerramienta", "ModeloHerramienta", "UbicacionHerramienta", "FotoHerramienta", "Envio_id", "DescripcionHerramienta", "RegistroFacturaHerramienta", "Proveedor_id") FROM stdin;
16	Martillo2	10	1000.00	10000.00	2024-11-25				\N	\N		No	\N
18	martillo1	20	10000.00	200000.00	2024-11-25				\N	\N	\N	No	\N
20	alicate	20	10000.00	200000.00	2024-11-25				image/upload/v1732729905/herramientas/zultpl11rtd1c2cifdgk.jpg	\N		No	\N
\.


--
-- TOC entry 3712 (class 0 OID 16913)
-- Dependencies: 257
-- Data for Name: dashboard_material; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_material (id, "NombreMaterial", "StockMaterial", "PrecioMaterial", "TotalMaterial", "FechaCompraMaterial", "DescripcionMaterial", "ColorMaterial", "PesoMaterial", "DimensionesMaterial", "DetalleMaterial", "EstadoMaterial", "UbicacionMaterial", "FotoMaterial", "Envio_id", "RegistroFacturaMaterial", "Proveedor_id", "StockOriginal") FROM stdin;
33	Madera	11	10000.00	110000.00	2024-12-02								image/upload/v1733116422/materiales/sk2nqgwac6oymeujk2ro.jpg	\N	No	\N	22
\.


--
-- TOC entry 3724 (class 0 OID 17103)
-- Dependencies: 269
-- Data for Name: dashboard_perdidas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_perdidas (id, "NombrePerdida", "CantidadPerdida", "ValorUnitarioPerdida", "ValorTotalPerdida", "FechaPerdida", "MotivoPerdida", "DescripcionPerdida", "FechaRegistro", "UltimaModificacion", "Producto_id", "Usuario_id") FROM stdin;
51	Perdida de Destapador de Cerveza	1	5.00	5.00	2024-12-05	otros		2024-12-05 04:29:11.132378+00	2024-12-05 04:49:03.99373+00	67	1
53	Venta de tabla de asado	1	25000.00	25000.00	2024-12-08	otros		2024-12-08 04:28:37.655557+00	2024-12-08 04:28:37.655557+00	66	1
54	perdida de tabla de asado	1	25000.00	25000.00	2024-12-08	otros		2024-12-08 04:29:31.599507+00	2024-12-08 04:29:31.599507+00	66	\N
\.


--
-- TOC entry 3718 (class 0 OID 17011)
-- Dependencies: 263
-- Data for Name: dashboard_producto; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_producto (id, "NombreProducto", "PrecioUnitarioProducto", "PrecioTotalProducto", "CantidadProductoVendido", "CantidadProductoDesechado", "DescripcionProducto", "UbicacionProducto", "EstadoProducto", "FechaProducto", "DiasProducto", "ProductoAgotado", "HoraCreacion", "FotoProducto", "Categoria_id", "StockProductoActual", "StockProductoInicial") FROM stdin;
68	caja de emergencia	20000.00	0.00	1	0				2024-12-02	1	t	2024-12-02 05:05:46.600551+00	image/upload/v1733115948/productos/cwovrj0ybmjqgl8vzeot.png	6	0	1
65	Tabla de Asado medida de 50 cm	20000.00	180000.00	1	0				2024-12-02	0	f	2024-12-02 04:51:17.80808+00	image/upload/v1733115079/productos/jciy8tuylrg11v5bovx9.png	\N	9	10
64	Letrero decorativo	18000.00	180000.00	0	0	En lenga reciclada\r\nTrabajo 100% artesanal\r\nPirograbado a mano 💅\r\n\r\n$18.000 cada uno			2024-12-02	0	f	2024-12-02 04:49:40.561346+00	image/upload/v1733114987/productos/sd1qldmiq0lsd5hsdbta.png	\N	10	10
67	Destapador de Cerveza	5.00	0.00	3	1				2024-12-02	4	t	2024-12-02 04:53:04.726199+00	image/upload/v1733115185/productos/rkagxdjts5tyqbourjdz.png	6	0	5
62	Repisa exhibidora	1000.00	10000.00	0	0				2024-12-01	0	f	2024-12-02 01:56:50.593215+00	image/upload/v1733104612/productos/kruwnqn8afw6ip1sqkkd.png	\N	10	10
63	Repisa exhibidora	1000.00	10000.00	0	0				2024-12-01	1	f	2024-12-02 02:27:47.574031+00	image/upload/v1733114386/productos/pr52srho8ovds6opcrk1.png	\N	10	10
66	Tabla de Asado medida de 60 cm	25000.00	75000.00	5	2				2024-12-02	6	f	2024-12-02 04:51:58.963955+00	image/upload/v1733115120/productos/x9u59rshqgqsld6suvyr.png	\N	3	10
70	Portacinturon	10000.00	0.00	1	0	Personalizado Con grabado de academia y nombre\r\nGracias por la preferencia ❤️			2024-12-02	0	t	2024-12-02 05:25:15.593671+00	image/upload/v1733117124/productos/tjpy5ofxg13uodmo7ibj.png	\N	0	1
\.


--
-- TOC entry 3722 (class 0 OID 17067)
-- Dependencies: 267
-- Data for Name: dashboard_productomaterial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_productomaterial (id, "CantidadUsada", "DescripcionUso", "FechaRegistro", "UltimaModificacion", "Material_id", "Producto_id") FROM stdin;
10	10		2024-12-02 05:25:26.282452+00	2024-12-02 05:25:26.282452+00	33	70
\.


--
-- TOC entry 3704 (class 0 OID 16823)
-- Dependencies: 249
-- Data for Name: dashboard_proveedor; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_proveedor (id, "NombreProveedor", "RutProveedor", "MarcaProveedor", "ComentarioProveedor", "CiudadProveedor", "RegionProveedor", "PaisProveedor", "TelefonoProveedor", "FotoProveedor", "FechaCreacionProveedor", "FechaModificacionProveedor") FROM stdin;
69	 Importadora del Sur	98.765.432-2	Importadora del sur	\N	\N	\N	\N	\N	image/upload/v1731774392/proveedores/i1vviyw74sx88rvsot8q.png	2024-11-16 16:26:33.218981+00	2024-11-16 16:26:33.218981+00
70	Camion	98.765.432-4	Camion2	\N	\N	\N	\N	\N	image/upload/v1731774520/proveedores/ajamfxgwyedi45638wum.jpg	2024-11-16 16:28:41.265164+00	2024-11-16 16:28:41.265164+00
67	Recasur	98.765.432-1	Oviedo	\N	\N	\N	\N	\N	image/upload/v1731708882/proveedores/radipt4spymxezb8gwga.jpg	2024-11-15 22:14:31.713351+00	2024-11-25 16:55:17.456733+00
\.


--
-- TOC entry 3720 (class 0 OID 17022)
-- Dependencies: 265
-- Data for Name: dashboard_ventas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.dashboard_ventas (id, "NombreVenta", "CantidadVenta", "PrecioVenta", "PrecioTotalVenta", "FechaVenta", "FechaRegistro", "Producto_id", "Usuario_id", cliente_id, cliente_eliminado) FROM stdin;
57	Venta de portacinturon 	1	10000.00	10000.00	2024-12-06	2024-12-06 06:08:14.738959+00	70	1	\N	f
58	venta de caja de emergencia	1	20000.00	20000.00	2024-12-06	2024-12-06 06:09:24.252396+00	68	1	\N	f
59	Venta de Destapador de Cerveza	1	5.00	5.00	2024-12-06	2024-12-06 06:13:44.914294+00	67	1	\N	f
62	Venta de Destapador de Cerveza	1	5.00	5.00	2024-12-06	2024-12-06 06:17:07.282685+00	67	1	\N	f
60	venta de talba de asado 	1	25000.00	25000.00	2024-12-06	2024-12-06 06:15:33.030918+00	66	1	\N	f
61	talba de asado	1	20000.00	20000.00	2024-12-06	2024-12-06 06:16:03.953951+00	65	1	\N	f
63	Venta de repisa	1	5.00	5.00	2024-12-06	2024-12-06 06:28:50.660502+00	67	1	\N	t
66	Venta de tabla de Asado	1	25000.00	25000.00	2024-12-08	2024-12-08 04:17:23.383096+00	66	\N	\N	f
67	Venta de tabla de asado	1	25000.00	25000.00	2024-12-08	2024-12-08 04:23:41.488416+00	66	\N	\N	f
68	Venta de repisa	1	25000.00	25000.00	2024-12-08	2024-12-08 04:25:48.545154+00	66	1	\N	f
69	Venta de repisa	1	25000.00	25000.00	2024-12-08	2024-12-08 04:26:46.323557+00	66	\N	\N	f
\.


--
-- TOC entry 3687 (class 0 OID 16505)
-- Dependencies: 232
-- Data for Name: django_admin_log; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_admin_log (id, action_time, object_id, object_repr, action_flag, change_message, content_type_id, user_id) FROM stdin;
1	2024-10-26 21:33:57.758299+00	2	skarlett	1	[{"added": {}}]	4	1
2	2024-10-26 21:34:15.267844+00	2	skarlett	3		4	1
3	2024-10-27 00:19:04.132975+00	1	richard	2	[{"changed": {"fields": ["Email address"]}}]	4	1
4	2024-10-27 00:20:54.997608+00	3	kuromechiv	1	[{"added": {}}]	4	1
5	2024-10-27 00:21:18.131192+00	3	kuromechiv	2	[{"changed": {"fields": ["Email address"]}}]	4	1
6	2024-10-27 00:21:48.215996+00	3	kuromechiv	2	[{"changed": {"fields": ["Staff status", "Superuser status"]}}]	4	1
8	2024-10-27 05:11:06.195822+00	4	kuromechiv7c5506de4b004999	3		4	1
9	2024-10-27 05:11:15.390297+00	5	morikunmev	3		4	1
10	2024-10-27 05:15:48.70436+00	3	kuromechiv	3		4	1
11	2024-10-29 03:28:47.066548+00	2	usuario1	2	[{"changed": {"fields": ["Staff status"]}}]	4	1
12	2024-10-29 03:29:54.086722+00	2	usuario1	2	[{"changed": {"fields": ["Superuser status"]}}]	4	1
13	2024-10-29 03:30:56.030066+00	2	usuario1	2	[{"changed": {"fields": ["Staff status", "Superuser status"]}}]	4	1
\.


--
-- TOC entry 3673 (class 0 OID 16405)
-- Dependencies: 218
-- Data for Name: django_content_type; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_content_type (id, app_label, model) FROM stdin;
1	admin	logentry
2	auth	permission
3	auth	group
4	auth	user
5	contenttypes	contenttype
6	sessions	session
7	dashboard	producto
8	social_django	association
9	social_django	code
10	social_django	nonce
11	social_django	usersocialauth
12	social_django	partial
13	dashboard	categoria
14	login	tokenrecuperacion
15	login	usuario
16	dashboard	hola
17	dashboard	catalogo
18	dashboard	catalogoeee
19	login	nose
20	prueba	servicio
21	login	passwordresettoken
22	dashboard	proveedor
23	dashboard	factura
24	dashboard	envio
25	dashboard	herramienta
26	dashboard	material
27	dashboard	ventas
28	dashboard	cliente
29	dashboard	productomaterial
30	dashboard	perdidas
\.


--
-- TOC entry 3671 (class 0 OID 16397)
-- Dependencies: 216
-- Data for Name: django_migrations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_migrations (id, app, name, applied) FROM stdin;
73	contenttypes	0001_initial	2024-11-13 15:50:30.466924+00
74	auth	0001_initial	2024-11-13 15:50:30.693666+00
75	contenttypes	0002_remove_content_type_name	2024-11-13 15:50:30.915779+00
76	auth	0002_alter_permission_name_max_length	2024-11-13 15:50:31.138522+00
77	auth	0003_alter_user_email_max_length	2024-11-13 15:50:31.397764+00
78	auth	0004_alter_user_username_opts	2024-11-13 15:50:31.623538+00
79	auth	0005_alter_user_last_login_null	2024-11-13 15:50:31.844534+00
80	auth	0006_require_contenttypes_0002	2024-11-13 15:50:32.068419+00
81	auth	0007_alter_validators_add_error_messages	2024-11-13 15:50:32.314303+00
82	auth	0008_alter_user_username_max_length	2024-11-13 15:50:32.567724+00
83	auth	0009_alter_user_last_name_max_length	2024-11-13 15:50:32.855331+00
84	auth	0010_alter_group_name_max_length	2024-11-13 15:50:33.102453+00
85	auth	0011_update_proxy_permissions	2024-11-13 15:50:33.385719+00
86	auth	0012_alter_user_first_name_max_length	2024-11-13 15:50:33.626879+00
87	admin	0001_initial	2024-11-13 15:50:45.984467+00
88	admin	0002_logentry_remove_auto_add	2024-11-13 15:50:46.207108+00
89	admin	0003_logentry_add_action_flag_choices	2024-11-13 15:50:46.441387+00
90	sessions	0001_initial	2024-11-13 15:51:10.86841+00
91	dashboard	0001_initial	2024-11-13 15:51:26.752751+00
92	login	0001_initial	2024-11-13 15:51:58.202195+00
93	login	0002_delete_nose	2024-11-13 15:51:58.444481+00
94	login	0003_passwordresettoken	2024-11-13 15:51:58.669165+00
95	login	0004_delete_passwordresettoken	2024-11-13 15:51:58.8909+00
96	dashboard	0002_factura_documentofactura_alter_factura_fechaemision_and_more	2024-11-13 16:03:17.114078+00
97	dashboard	0003_factura_documento_asset_id	2024-11-14 01:56:07.146336+00
98	dashboard	0004_alter_envio_tipoenvio	2024-11-14 05:24:18.395625+00
99	dashboard	0005_rename_fecharecibida_envio_fechacompradaenvio	2024-11-14 05:33:02.828602+00
100	dashboard	0006_remove_envio_fechacompradaenvio_and_more	2024-11-14 06:52:12.445437+00
101	dashboard	0007_envio_horacreacion	2024-11-15 05:30:06.932921+00
102	dashboard	0008_alter_envio_horacreacion	2024-11-15 05:47:20.083237+00
103	dashboard	0009_alter_envio_id_herramienta_material	2024-11-16 03:05:20.931137+00
104	dashboard	0010_herramienta_descripcionherramienta_and_more	2024-11-16 15:48:45.554753+00
105	dashboard	0011_herramienta_proveedor_material_proveedor	2024-11-16 16:06:35.335844+00
106	dashboard	0012_envio_factura_factura_numerofactura	2024-11-16 19:01:44.189718+00
107	dashboard	0013_alter_herramienta_marcaherramienta_and_more	2024-11-22 21:46:48.231814+00
108	dashboard	0014_categoria_cliente_producto_ventas	2024-11-26 17:13:10.771908+00
109	dashboard	0015_remove_producto_stockproducto_and_more	2024-11-26 21:38:49.913268+00
110	dashboard	0016_alter_material_options_material_stockoriginal_and_more	2024-11-27 04:09:29.81997+00
111	dashboard	0017_alter_producto_categoria	2024-11-27 23:01:18.803401+00
112	dashboard	0018_rename_productovendido_producto_productoagotado_and_more	2024-11-29 17:36:35.422862+00
113	dashboard	0019_alter_productomaterial_material	2024-11-30 17:55:54.690973+00
114	dashboard	0020_remove_ventas_cliente_cliente_venta	2024-12-01 03:40:45.146336+00
115	dashboard	0021_perdidas	2024-12-01 15:39:52.934348+00
116	dashboard	0022_alter_perdidas_producto	2024-12-01 15:47:54.93008+00
117	dashboard	0023_alter_ventas_producto	2024-12-01 16:15:39.397226+00
120	dashboard	0024_alter_cliente_options_remove_cliente_apellidocliente_and_more	2024-12-02 02:18:43.325852+00
121	dashboard	0025_alter_cliente_options_remove_cliente_direccion_and_more	2024-12-02 02:18:52.756036+00
122	dashboard	0026_remove_cliente_venta_ventas_cliente	2024-12-02 02:18:55.133361+00
123	dashboard	0027_categoria_cantidadcategoriaperdida_and_more	2024-12-02 06:20:03.542191+00
124	dashboard	0028_remove_categoria_dinerocategoriaperdida_and_more	2024-12-03 05:55:39.299713+00
125	dashboard	0029_ventas_cliente_eliminado	2024-12-06 06:24:01.539264+00
126	login	0005_alter_usuario_tipousuario	2024-12-06 18:14:31.494599+00
\.


--
-- TOC entry 3688 (class 0 OID 16533)
-- Dependencies: 233
-- Data for Name: django_session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.django_session (session_key, session_data, expire_date) FROM stdin;
wf4fmpwrsunxgvk1amtxvd8joiugyk30	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tAKdt:0ixv8HoEnoHWsXr4gCFYIHhrGpqtAy3a1lnnVcmq6vM	2024-11-25 02:59:05.195726+00
jbup8capzytn71vphqml033ffrq343rp	.eJxVjMEOwiAQBf-FsyGwtKX06N1vIAssFjVgoE00xn_XJj3o9c28eTGL6zLbtVG1KbCJSXb43Rz6K-UNhAvmc-G-5KUmxzeF77TxUwl0O-7uX2DGNn_fyujgSQsZB2WUDEBSe_DgolGA4GOPHQoIcYg6mrETEHvhSOuxA_AGtmij1lLJlh73VJ9sEu8PhJk-4Q:1tC5RX:7dUvo3aQ2O4F4nFig7y9c05cKtT5J0lQsktWcJVW90g	2024-11-29 23:09:35.833758+00
8yv89ka6dp6li0ww0ul36rxsnttrn9bx	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t6hp6:P9iHhRtqdIUxzZo4UTRG2uqn5TMNb_0c6_ThpxILKrE	2024-11-15 02:55:40.503181+00
rhh5b5bxe8iui785yh5m0vm8fsddhtxw	.eJxVjMEOwiAQBf-FsyFAKVt69O43kAW2FjVgoE00xn_XJj3o9c28eTGH6zK7tVF1KbKRSXb43TyGK-UNxAvmc-Gh5KUmzzeF77TxU4l0O-7uX2DGNn_f2gIo0l7IyWrVT6AlQQRBGqE3FMIAUcrOakBljVfGDxY7EjhM1sjebtFGraWSHT3uqT7ZKN4fWLY-Pg:1t6nM4:X5fXKU12F0FhNAStlXYHODxMiinmokkSewWHlonN1Lk	2024-11-15 08:50:04.156124+00
yfl9dqleyu9ckp3bd8gd2cghxuwe2yhe	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t6oPJ:v8OxjB3JTwd43vOAsNt3lW-mPrdshDxHrhdEFGLOBFo	2024-11-15 09:57:29.236739+00
w3x8bue94b8lb8rrj2ddwz49cuq2nwiz	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t6qja:BT0Qz-7o8bhh2ITL4455SFBOyRTaiemREZInm1etyDQ	2024-11-15 12:26:34.308293+00
xw5fghre1jo7vhlue75eo7yjlnprgj88	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t75eg:SmqqvRcGoDHo_4tWPXJQqXI14n_OVjSRgrqswzXwoXA	2024-11-16 04:22:30.649903+00
3vvri4d5dxwlieetrurc96739wa0egxj	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t7JFZ:6OyAWpf0-_sDlkR52X2Xr2q-8BuOO6EHDOhX0ZyhvjU	2024-11-16 18:53:29.315977+00
ewi9wdxi3hc1iqbb3smx7tbpcfjtp77p	.eJxVjMEOwiAQBf-FsyFAKVt69O43kAW2FjVgoE00xn_XJj3o9c28eTGH6zK7tVF1KbKRSXb43TyGK-UNxAvmc-Gh5KUmzzeF77TxU4l0O-7uX2DGNn_f2gIo0l7IyWrVT6AlQQRBGqE3FMIAUcrOakBljVfGDxY7EjhM1sjebtFGraWSHT3uqT7ZKN4fWLY-Pg:1t7JjY:bUyhCPhtrWSFpN3T1gyuB2XR-vgzSZWt_c1YdaQAMQw	2024-11-16 19:24:28.256161+00
5br8h7jpbcqxzf1zmia3c2jsritgzjz0	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t7Kio:PK_X5dFovy2CKsGnEPokl9_01kJqsUuTmBvaMqMxwek	2024-11-16 20:27:46.719191+00
kfkqkgnjl30aawfk72hpcnavoqvda5ct	.eJxVjEEOwiAQRe_C2hDAQUqX7j0DGZjRogaa0iYa4921SRe6_e_99xIBl3kIS-MpZBK90GL3u0VMNy4roCuWS5WplnnKUa6K3GiTp0p8P27uX2DANnzfkZ3zpKCzNqJSBK5Djgix0x5gb5BQe-Oss5wMYDIHJg2WtTpb51mt0cat5VoCP8Y8PUWv3h-AmD7X:1t7Wxp:48RFac_WI4drqgWyUgkeX_C2k6EWX3SfY9JDXgyy3n4	2024-11-17 09:32:05.945746+00
bzqzx8gwsal5enxvt828x92kcfw9dj50	.eJxVjEEOwiAQRe_C2hDAQUqX7j0DGZjRogaa0iYa4921SRe6_e_99xIBl3kIS-MpZBK90GL3u0VMNy4roCuWS5WplnnKUa6K3GiTp0p8P27uX2DANnzfkZ3zpKCzNqJSBK5Djgix0x5gb5BQe-Oss5wMYDIHJg2WtTpb51mt0cat5VoCP8Y8PUWv3h-AmD7X:1t7bPw:ZHgk8WaKeTAvr_CGduOff4PNDVzx2JK7-Dcw2VYikvo	2024-11-17 14:17:24.258861+00
cvbvoju4j9obel0a3cqyrdcvtxobxths	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t7scF:A1kKFl3okrkBYfnpt9XrQpVOgTRrKxvZRICX4SK20wc	2024-11-18 08:39:15.694512+00
c74nkvb5nebppqqhxj945ckg6o7gjvtt	.eJxVjEEOwiAQRe_C2hDAQUqX7j0DGZjRogaa0iYa4921SRe6_e_99xIBl3kIS-MpZBK90GL3u0VMNy4roCuWS5WplnnKUa6K3GiTp0p8P27uX2DANnzfkZ3zpKCzNqJSBK5Djgix0x5gb5BQe-Oss5wMYDIHJg2WtTpb51mt0cat5VoCP8Y8PUWv3h-AmD7X:1t7yHz:9t72QzaCk52ThUzcABUrn_tRWr6gbSqI4yhMFjXc4lo	2024-11-18 14:42:43.257307+00
ums8qy0xghn7807yqprlgweplv20lvia	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t6P6E:ayWm4Wj58RIGN9ltIwU3U8gaMVHmsbCGDyHEOwpxgJ4	2024-11-14 06:56:06.21026+00
nq53um5hkhfznua7tczdu062aeukn9of	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t8TAM:Xb2YRKMeqiK9Y_ZhktCvsuv3hqZkD6FXiPv0yqcL1hI	2024-11-19 23:40:54.943102+00
45vuwqrn16s9p1hu7gq0y8ibkr3d8vzg	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1t8WQd:l38Q1vox-0ujy8c_iSm7V_h6oJfTE9n14UKhaI5ZVYw	2024-11-20 03:09:55.777104+00
l2nogwwd38b2z36wmgrzkgewi8ojocqe	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t6Uvo:rr6-75VNNgIznmk3oCC-0ufr_7HBf-Vv-WtoOk3qFuE	2024-11-14 13:09:44.421336+00
4dwsx67q2bbq1qlbwgt57jqokvee0p0z	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t8fAR:ooPutvRrwHuKWz6431-RV48kUdbQ4CZKP6GEKssbSOA	2024-11-20 12:29:47.792686+00
8t1e6hj3piougtbgcxw67rffmrja7kg4	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t6VoY:BOgCGtmVRnnteyNJlBNY9EQgWKOndf0AmswcsDnyvJg	2024-11-14 14:06:18.863542+00
vkv89pe8sm64ax9s4nzhqyivqtg26ilz	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1t93Kj:2Dj11QpXCCy1t6tJ3vZ65sMR4KHWTbzyFgX_iNCLmHo	2024-11-21 14:18:01.962977+00
aisucfjruwkogj0egy0y70uxv0cpcrsn	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t6fer:chq1rJtwVDhTnTDuMt04AEyQteWZn06NFYnbaX3ndro	2024-11-15 00:36:57.145596+00
zt6x7k4gio5hufj2g54r1as3th3i6gg5	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1t93SF:4m8JLrlTS5hOta4ZiYvYa1GvZyaKe_IwJrJdFcuh_O8	2024-11-21 14:25:47.532652+00
x2c3b518m2ghodoy748rij41i9z9ki8u	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t9Rtd:C_I27vgVMU4bDjqeT6TGQ-b4zoY6-eftxwlVBceXiak	2024-11-22 16:31:41.831483+00
guv1n41sg0d5elja0apnk1apss69zczr	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t9Yxe:1mIuvQv69rPe-MESdLzU_fW-6dJ8VrK_ySJENJ2AWL4	2024-11-23 00:04:18.216116+00
p15k8e7q90thw3b8cevl0ibxrcezk7yh	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tALqA:DrYmihzEt-ItKMYnAiPSy9IhIB1hJdBrnU_AeGtSR9c	2024-11-25 04:15:50.965124+00
d25e9is784mwgc2gskjrzfyhsi623okv	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1t9Zdp:kyLWWjo_lQEOlf8Sch-BojX122GLkPyw-U9PID9pnig	2024-11-23 00:47:53.898379+00
e0c22vvbcsq9unq6c1qg7xmb6cv5hf2m	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tAYWM:HRxDCtAle8K4J_sKeDRf3l1zcL6J1jpTZV5X518RxqE	2024-11-25 17:48:14.593302+00
32um8tuc9tm98jsstlft6g4racwnkfgr	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tAYX5:0FOCcjpdXYRB2kdFTwDhoFhcC0BDhuRc3W7ZUR0q270	2024-11-25 17:48:59.529159+00
cnm5y9ppac3if1sx4jkh1b07ku9p30gd	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1t9ndM:DePme7xYLcuYShVuqrpxD3rsDVQ47-r94k571iT3fd8	2024-11-23 15:44:20.847742+00
13fs0c3m68ji8khfefueustb7cnpz2pi	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tAYjC:9lhc5jBDIqAL7Aw79C9K3o8L1unNqLmlXNGJn_kzSzc	2024-11-25 18:01:30.94223+00
6fy8i0g9zikp4pz0p8kj0j60ypxb8zuv	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1t9rzj:fyOAwwUTmAEQXoiHTFJXTyqOoKwkzr-uMAvE_89qCPA	2024-11-23 20:23:43.732773+00
ks4afyfue0ofx7dlru1a10yulsx0hxup	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1t9tXA:HXs1DCC9vj4ClZVQq7opHCXKQEAoLVueqeTAAieHOtg	2024-11-23 22:02:20.383574+00
03ckglf99q7bboep6d4zvqqb4yh3b1de	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tAYpg:t-Y6eQSE4tVjrWhdFjTnnY0rGuO8_9AKuFXlygfKv-I	2024-11-25 18:08:12.607147+00
85dm06wvw6tl2wpuo5xc5ccuy0ticf3y	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tAZJf:JfiRH0dM4F5dokZtjNHGM3E3B1tb1RFwgLkT6fgmE8U	2024-11-25 18:39:11.769922+00
okmbm63kvkooa3uqv3jrjaz1yzyvxdlk	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tAEOi:Hr8EE5WqJCC0R7LxGiZBp7hwJKcf7CPEA-5Mku04-NU	2024-11-24 20:19:00.64747+00
n9s6vgbtt8kyv2beejm3hxndzotgpolq	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tAH4x:wxPhcEJQBuwrvjGtkRn6TPOFgtbaN59XgIATda24tm0	2024-11-24 23:10:47.632699+00
cer7ursnx0o7ibpy4hsrg6akdpfbbq1a	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tAH6N:JUOlddTwPe48rfrEtZgoXwoEEyApKRoJ2cOGpoTv3dQ	2024-11-24 23:12:15.185668+00
p925gxz0kyf61ftsp208fbmot2us7kdt	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tB5Y8:yigcptY3vA4EVJQ2sfogaR6KN_QSPuoz1SumIqWdfKE	2024-11-27 05:04:16.837488+00
fhjbdpkw8k9e3gnh3drxkftom7cq81qt	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tB8bS:XAm5mtr1z5NG_bZBJOLFtgjmmnDxDzW77y4PxhiG4Nw	2024-11-27 08:19:54.675138+00
l7l2u250do1xkwvb5r0xkbsmbimpps1y	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tBFfN:_wlR2hUWb4jueRoJE2LboUOfxmBWYN34QHhkaN_XBNk	2024-11-27 15:52:25.462463+00
wkrl0bsr9w02ar07uvwofjx59yjbn3hv	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tBOpz:iIbHNyWl_GiaAFAW2s_gN2xfDQscqH2iv3RAsS9wUJA	2024-11-28 01:39:59.430975+00
j83abzg5kks4r0bw7nd6yyt5zdcpebd8	.eJxVjEEOwiAQRe_C2pBioZQu3XsGMjMwFjXQlDbRGO-uTbrQ7X_vv5fwsC6jX2ucfQpiEEocfjcEusW8gXCFfCmSSl7mhHJT5E6rPJcQ76fd_QuMUMfvu6eAyoImIsWkO9MzhUYZZOuAoXVGs2GLtjtqAsQOVGudZQMu9MrGLVpjralkHx9Tmp9iaN4fzBFADw:1tBZB0:96xYr-yqCCYuE-HKgyFlE25Y0qOKLwpzYVUfDNJqvoM	2024-11-28 12:42:22.251812+00
nhjit1q91rbfef7i8eozr10roedjnz8v	.eJxVjMEOwiAQBf-FsyEsWEp79O43EBYWixpooE00xn_XJj3o9c28eTHr1mWya6NqU2AjA3b43dD5G-UNhKvLl8J9yUtNyDeF77Txcwl0P-3uX2Bybfq-nREQus4AeoI4kAmAupeIcTCSZK8dEhglIkUKWh416SgUQkfK696oLdqotVSypcec6pON4v0BpPA_eA:1tBi0k:J0cK5khQ_MHkAEUWlzjhiBSPsAUxPQZ6eoVbYiSYITU	2024-11-28 22:08:22.848751+00
bj4qicjmxtk6rzjqpmhwtul428x2t1n4	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tBnCN:cNk8JSqDuwuPOfa9dTv7lhS31x0TV43WjT2pqaAmq1g	2024-11-29 03:40:43.178699+00
yf45l3gzoxk2sdlmtl1w845gqqna6xyq	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tBnCS:BIa4CQOmEGJ1wrzXaoNcPG28KDL9LwpKwm2dHKKXO_M	2024-11-29 03:40:48.764664+00
eyv8bs8txqvcbro6jknyob35t9i9jj9c	.eJxVjE0OgjAYRO_StWkKhaIs3XuG5vtDqqYlLSQa492FhIVuZvHezLyVh2Ue_VIk-8CqV5U6_DIEukvcBN8gXpOmFOccUG8VvduiL4nlcd67fwcjlHFdG9fiIBURWSYxwqfaWRragQgRTWNNDVQ3a3B15NYxW4vQraiz4Bxup0VKCSl6eU4hv1RvPl_g_kBn:1tBoJO:M7Tn0yQqru43-wUIH40RTugTqsilSJwv5QllTKUMJIY	2024-11-29 04:52:02.73915+00
n1ny3v5t7bpgkvrjn9b1v2iepvehkn2e	.eJxVjE0OgjAYRO_StWkKhaIs3XuG5vtDqqYlLSQa492FhIVuZvHezLyVh2Ue_VIk-8CqV5U6_DIEukvcBN8gXpOmFOccUG8VvduiL4nlcd67fwcjlHFdG9fiIBURWSYxwqfaWRragQgRTWNNDVQ3a3B15NYxW4vQraiz4Bxup0VKCSl6eU4hv1RvPl_g_kBn:1tBp3E:CfIjnaoN95YsJoPDlVhcBPJi8vDpLGLsFp5LqGFKTQ4	2024-11-29 05:39:24.132689+00
lp1kuq9r9tiowcms1vr36d2x02mwngxw	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFzdm:b-8r6bEccNtZ1zCC-41JnQmDt6Kr7CweuQ-4baFHZxY	2024-12-10 17:46:22.416906+00
sv48fngerv9e6txe9k5ilyhgc3ybjyou	.eJxVjMEOwiAQBf-FsyGwtKX06N1vIAssFjVgoE00xn_XJj3o9c28eTGL6zLbtVG1KbCJSXb43Rz6K-UNhAvmc-G-5KUmxzeF77TxUwl0O-7uX2DGNn_fyujgSQsZB2WUDEBSe_DgolGA4GOPHQoIcYg6mrETEHvhSOuxA_AGtmij1lLJlh73VJ9sEu8PhJk-4Q:1tC1zM:izG92SA9ADdUKlAOb4L5Rl9VBqcImb7iE7YXBDWinc4	2024-11-29 19:28:16.663168+00
o5iu98bxvgevrartokijlxo265imawld	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tC3YH:GWLptb2yTkno8sx1jj5C4DJ6NzhGdp82zIrW-PfLXFE	2024-11-29 21:08:25.457565+00
htltfju6s7zy6akyosjkg3b77xtetmji	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tC8Qm:vRtpY06vVBxwwuV2uyViGnfu3X0u8w17zHavfhvphhU	2024-11-30 02:21:00.292597+00
l5lhuf6cwcwqgbe4kbwzz52fz4xvft9j	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tC98B:dNzRcyd9KqZm3Tc5D-8_Pb8z4jRUuUCJT71uu4fw56g	2024-11-30 03:05:51.88525+00
rtf286wh022id6936jzaa6i67b3fx6tk	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tCL39:0LSAt4622Dq-vAdLR4a_3ke3mHwqe13EaP6qOqcBWHo	2024-11-30 15:49:27.333464+00
igyj9aith1p11soqn1lfwagnhckgcjht	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tCM7K:2aQSpIYxOxO5VFyTalt_QBXDVjWMjQ61_FM-3C5DjPo	2024-11-30 16:57:50.877484+00
eumac650pntve83h4s9mmymtecvfw5l7	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tCS8o:MXTuMO3D3aEX_ldxcxxWKKP3x1csxKj8LE4efQv9suA	2024-11-30 23:23:46.694255+00
zvfpeu6e4yij3v4qiq1t1uyrkzfuw0em	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tCSLQ:ufKV2FL-I4wy4J280nTuoEdF_jCzb4841DfzFe1lQuA	2024-11-30 23:36:48.953958+00
zqooaaarbvum6y6z88egnk27r6x8fqbt	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tCTCQ:FYnX-qwWqrJm67kYNFAQGvyg_L0Q_H6AtQUKAxQ8X9k	2024-12-01 00:31:34.442633+00
e3jbwzhtvnxx33zc5jy92d0i6az49o7j	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tCipj:s9s1lLmR9ADlF4YxOY7wRrMZUUvnVPR8LzqKnWB27zU	2024-12-01 17:13:11.983505+00
rm2e0dalflb7azp8xwq9j8t1i1re6wnr	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tCkbc:PiwLJWKmpcWgXaPC3pLOP-8UODhYJVO9UNFLo6-iayA	2024-12-01 19:06:44.587717+00
cn20s6o499p7s0thnovv493bfuac5q4v	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tCnRq:tlMqIk808FjKvjX2WyM2VzykPUUx0rzSEfupRm79K48	2024-12-01 22:08:50.643468+00
o5acidb48c0qby4wh612fr12l2su4jmo	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tD3lc:OnG6gGc-9hSbz_XsFrk26JIOGZ8l8Bc1dgqCyneS0jg	2024-12-02 15:34:20.362406+00
4lmmbyuz9nxltvyvohw3xcenhjrbh0ae	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tD46n:G7R5-JB2V7RsQJUiOgHkBmHpjgzofyE7GFIHpUh_GsA	2024-12-02 15:56:13.905374+00
o4ukaan7kilxo1rfuhipjgufkrbuy2mg	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tD4GV:HQiHJMT6IQpno1kv0804rcGmvqiJtdrU7oaPSBxP-tg	2024-12-02 16:06:15.41354+00
7diqcep9jli06ygfv4bq7pbk10f7zl3r	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tD4GV:HQiHJMT6IQpno1kv0804rcGmvqiJtdrU7oaPSBxP-tg	2024-12-02 16:06:15.544366+00
p180wwr64kyovc71no9lf6fctrf5n2ks	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tD7r9:eTXCkjmQJX6U-Zhum5-kI4Qk3B6Dg59IXu0DGuEip8o	2024-12-02 19:56:19.421131+00
l1fne4ubkcuwctg6q7iiy2j5ei3sm4n0	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tDARH:cb8av9U2lZzLx5DPMKR2sduZUSP6rqQJlz0PmLup-Es	2024-12-02 22:41:47.676458+00
k1gcgng0gp1itwl12xohiww76t0rs76i	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tDAoT:N56I2p9Ov83Rz-oqA6f46tiuiy4aLr-p2yNr02ll08M	2024-12-02 23:05:45.019455+00
89immv5yfg1e4rkhbnk5cpneb8copey8	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tDAv7:WjGdf07nhNiFQCx3Vsq28zHw085It-nseHYkxEzw-mA	2024-12-02 23:12:37.241569+00
jwhepux6p3m8ctvcvo773cpq6i50b9zk	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tDPyp:5FoulnurFGmxwfmN2Ry92cwWoPmmBXsk9BHWiVO2ZBI	2024-12-03 15:17:27.146222+00
52l1z92c928fpbhoi9yaj7ect846djat	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tDoxB:5KkRIOE722MSWYrtDHIk83UDJiNb3xwdam7-69Ak4BM	2024-12-04 17:57:25.068238+00
0nb36xhozcx0uknxiyupdsakee2siy7o	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tDpiF:AqHmMpae-BNHU6-YZIP-dJdQqEznDA1t_QUM6y2JBCM	2024-12-04 18:46:03.448729+00
j8qcvn879ax6d8b7jf2a62rqe3pueagt	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tDx00:3yp3ErKga--G9ZRHvQ5HytN2PeOXb2HWgOxkWrL0Kv0	2024-12-05 02:32:52.954797+00
97m5ywssrxcs647z608ihds018lj66i9	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tG9Rh:cu7mQ_lWA_mtjGCZe8BJqgNdFW9iqz3Tc-HKXIw01_M	2024-12-11 04:14:33.086585+00
qix7psf3mn2d2n73r5u7cjqe116p3yid	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGi89:Lf73BdKt3obXgBIu8PTid0omUnZHqj69pdcAtPQf69o	2024-12-12 17:16:41.17801+00
167w7uh06cx0vapphbs5d2jkzefb9r0u	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tITc5:t5FCf6rBViSMtvOVXqJdEhlZlhy4fHogIk5UHPH511k	2024-12-17 14:10:53.277465+00
jk8o80o0s31glxs7pa5xrjva84nipwiz	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tJGc5:LzKD2syjZ6tuOvb0IFRmTGLU4Q4NEq7rbnvqaEDB2Hk	2024-12-19 18:30:09.394482+00
p02m0oa60fihyfv5lhaw3em47zy2lwba	.eJxVjMsOwiAUBf-FtSFQHtIu3fsN5AIXixpooE00xn9Xki50e2bOvIiFbZ3t1rDaFMhEODn8bg78DXMH4Qr5Uqgvea3J0a7QnTZ6LgHvp939C8zQ5u-bKS1QAioXIxotPZiBRym5BDFGjCJwGDwfRsGc5yowDaMw4I6ooxeG9WjD1lLJFh9Lqk8ysfcHnNw_YQ:1tKPVq:lyAUWVPeKsr8QSloHWoE_6AJ5RVR_MOB8rOklLxSkko	2024-12-22 22:12:26.530147+00
uayoi9pspfb8q88nejvqedpvu3wtberc	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tDxVR:wechWPCW4xz0ffDbnwc_SrnHXqFeGZtvxYiE0IAyIsg	2024-12-05 03:05:21.515798+00
1zjk1okus1fe8kppfko7yt1ia8l3ywck	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tG9Rk:7lT6IRQzmqy4-g6rqdu7kuYiA7yQaNvODMom0L_cHqQ	2024-12-11 04:14:36.903566+00
2ntu0du6nbfn0ntnwm20vqzh1o7jkqh0	.eJxVjMsOwiAUBf-FtSFQHtIu3fsN5AIXixpooE00xn9Xki50e2bOvIiFbZ3t1rDaFMhEODn8bg78DXMH4Qr5Uqgvea3J0a7QnTZ6LgHvp939C8zQ5u-bKS1QAioXIxotPZiBRym5BDFGjCJwGDwfRsGc5yowDaMw4I6ooxeG9WjD1lLJFh9Lqk8ysfcHnNw_YQ:1tKLIg:QbGQU4xnCqMv1-p2QYLW4aMHQ85ovmhy7qwI4iu4W-Y	2024-12-22 17:42:34.749485+00
pdxekuaesnln828u4fib1b9faqo5490y	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGiJV:z0CjmMaU--x_dGdKY1IcDOs1WWOLRuOlRKgpfizN-Zk	2024-12-12 17:28:25.926196+00
femc6qgi4y24vcp8axdxlvlhl82iyml0	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tITxh:X4xjRcjYzwvjE7uwbmOMxU2V_njk_eoYVGp08tdFaPU	2024-12-17 14:33:13.789922+00
h1qlz4lynprxu9an577ha21kyo18lqyb	.eJxVjMsOwiAUBf-FtSFQHtIu3fsN5AIXixpooE00xn9Xki50e2bOvIiFbZ3t1rDaFMhEODn8bg78DXMH4Qr5Uqgvea3J0a7QnTZ6LgHvp939C8zQ5u-bKS1QAioXIxotPZiBRym5BDFGjCJwGDwfRsGc5yowDaMw4I6ooxeG9WjD1lLJFh9Lqk8ysfcHnNw_YQ:1tKPdU:uWAnzyEWS0W7ivI1GMsgfDt-kTmeVFf8ENoa2gwO3Sk	2024-12-22 22:20:20.935238+00
9x15jm93hy16y8gq4aclxmqjfbnnqq45	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tJM2z:KAmdvZsLx_GF26iI8Ozk9TOa4MBCMDbPKat9moNSfdU	2024-12-20 00:18:17.237443+00
4cff5hyyalcs8usprxo1hvgjmuw7awv1	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGiVt:AzPO0bkZhjMakylln7uq5kQUz3pSWe0_KGmfrszMuNs	2024-12-12 17:41:13.182879+00
ctiq8c8dc074iq7pumkbiq9by8yp6suj	.eJxVjMsOwiAUBf-FtSFQHtIu3fsN5AIXixpooE00xn9Xki50e2bOvIiFbZ3t1rDaFMhEODn8bg78DXMH4Qr5Uqgvea3J0a7QnTZ6LgHvp939C8zQ5u-bKS1QAioXIxotPZiBRym5BDFGjCJwGDwfRsGc5yowDaMw4I6ooxeG9WjD1lLJFh9Lqk8ysfcHnNw_YQ:1tKPrX:EybHLnAKQkTEJqrXb0DpAPo7KltqCpY5AxDEQPToudA	2024-12-22 22:34:51.120587+00
rml5o0ayti5fx9ipg5pilz9jkbr1545f	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tIU1R:UjfcsXGzab_U3DVbQjCP63hSCzURaTZljIrml7DEP0c	2024-12-17 14:37:05.939346+00
z9h428osegj1urknmaazd5mbhfnu4oh0	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tJNOL:-TpHN6_yvQtSX337E53J3ORYtpNurzu5ydHDoAH-Nl8	2024-12-20 01:44:25.705427+00
ces59vllqdzjh4y53xxzrl0al6hpg1pk	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tEAHl:bg38IPP4574CQGY2ipaZfr-OmW7z4sipqXJYHdLqAWY	2024-12-05 16:44:05.469542+00
svwukjpw4z4mcv2c1saubwkoq5a10yxy	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGq1D:89VI5elG-nOZMw4pNnNgED-X59LaZYW0bRSGDBM6hu8	2024-12-13 01:42:03.931873+00
dycak9je2azl3iwuz1cylgca8sco31ta	.eJxVjEkOAiEUBe_C2pDPJODSvWcgDB8bNWCa7kRjvLuS9EK3r-rVizi_LpNbO86uJHIgjOx-t-DjFesA6eLrudHY6jKXQIdCN9rpqSW8HTf3LzD5Pn3fYFAjZi0Nl0Jl1BBUFCYazYMSAazUgwNTObGUbeI-SGWFNgxBohjRjr2XVh0-7mV-kgPjYPcA7w8AmUAm:1tIgdo:GYFPX3KFRMe_3wpbT1iBAwHbuKOcprHB_R7nWqcgvpw	2024-12-18 04:05:32.0421+00
ql0q7w4usjhw0hibal5jyx7vb499mrey	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tJNSV:L6gONH40ZLEKsjIc0G5_EarhPmg1l1xXkZ2p74pE6JY	2024-12-20 01:48:43.386308+00
ldazgfbgj7npcfdptlhsd03tz39jizi6	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tEArc:geE-LvkF1UKpBB0Pxt4AI38MstOrxQKPycQW58V3cb4	2024-12-05 17:21:08.531447+00
eiv6durgmskvp3xvg4i9su1dtrjexwe1	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGMBV:Q4H4p9Y-qqmpLCCBX-S0aaQCzOqSr8F_r273lZO-bAY	2024-12-11 17:50:41.765971+00
emr1lu5sgiq3px712b7epq5cnbhiztps	.eJxVjMsOwiAUBf-FtSFQHtIu3fsN5AIXixpooE00xn9Xki50e2bOvIiFbZ3t1rDaFMhEODn8bg78DXMH4Qr5Uqgvea3J0a7QnTZ6LgHvp939C8zQ5u-bKS1QAioXIxotPZiBRym5BDFGjCJwGDwfRsGc5yowDaMw4I6ooxeG9WjD1lLJFh9Lqk8ysfcHnNw_YQ:1tKLzE:Wlw5BhWPimM8xXeDN9b7-2sRiahrIadYO9AniVDllJ4	2024-12-22 18:26:32.187205+00
44a84qrqpcihzlykw82n10c80bjd350u	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGqGD:7KMEcldizEqYq-Xy0j6o7BC2Ib8gr0pC_NWtsbLfgak	2024-12-13 01:57:33.61016+00
5ok1r00ohf1fg8rx7osdnajqdxwxbrr3	.eJxVjEkOAiEUBe_C2pDPJODSvWcgDB8bNWCa7kRjvLuS9EK3r-rVizi_LpNbO86uJHIgjOx-t-DjFesA6eLrudHY6jKXQIdCN9rpqSW8HTf3LzD5Pn3fYFAjZi0Nl0Jl1BBUFCYazYMSAazUgwNTObGUbeI-SGWFNgxBohjRjr2XVh0-7mV-kgPjYPcA7w8AmUAm:1tIgjz:sXVRdJaMe3NN_LmM7LA5QI_yMrKMV25WanSUTV_ncBE	2024-12-18 04:11:55.324701+00
n7brcdtg3t3jnxf7d2n22yz8mai4xgnt	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tJPSf:0cxovuIm4ns2QJSbyn3ZX5ZwX4gDs7SIqUN2CJv727o	2024-12-20 03:57:01.108885+00
bhc1aupj7zfsg0n7si0yvckmr67ipn5h	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tEBGS:lFBtXD5gXDDZ6qTjATO3FA9Pim242nKsniuM9fVl1vk	2024-12-05 17:46:48.223879+00
c13me7cvol7wrrayr9d85abmhjpexltg	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGMPb:j2FH2IVbtg_FrFGx-bJ8D38T3LyMuWij1VKoreB7NAQ	2024-12-11 18:05:15.764431+00
l5c89wkf0v4kg7cohffklqw1uo7icts4	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGqVy:OaaQ6b7GQr5cXG2n8zLWvnT06c2sFF9wxN1U2ICPNqU	2024-12-13 02:13:50.858621+00
dz9jfnq6t1hg4lncbwwa1fodi1g2uzu3	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tJ17w:0NglLDyyKOjs7r_fTlOwNWOiA_ARM9vVAguiGuVRVOs	2024-12-19 01:58:00.311841+00
9lhsjmucl2ut3803vn8mamtf8dmiccft	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tJRh7:IBw0su69x20e--PnY7y1uhECqW_NUhmhRcVz9nHmWCI	2024-12-20 06:20:05.749878+00
9298y0nn309uti19jdf0tmw5fo8q036z	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tECbw:qCl2BC-w9vDr-FBgkOZJy5g_uchCSYR2VZ-jofUNsPw	2024-12-05 19:13:04.585478+00
cqp3jci9x029yriprh1n79si7pyyxyxg	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGMZi:6YnIUDgMEq9Pw9_LO1xjAslRCUnO9xY-sWFaeOT4rww	2024-12-11 18:15:42.733796+00
g4wt85vsia710vk5n9zz5lx9g86wipsb	.eJxVjEkOAiEUBe_C2pDPJODSvWcgDB8bNWCa7kRjvLuS9EK3r-rVizi_LpNbO86uJHIgjOx-t-DjFesA6eLrudHY6jKXQIdCN9rpqSW8HTf3LzD5Pn3fYFAjZi0Nl0Jl1BBUFCYazYMSAazUgwNTObGUbeI-SGWFNgxBohjRjr2XVh0-7mV-kgPjYPcA7w8AmUAm:1tH4u3:GhEkwQV66txbjsHghWSr4lNd2zmHO4Dk7aeaZQmkL5w	2024-12-13 17:35:39.054336+00
i25qevtwjx4enckhy20k0czlsl33ezfq	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tJ1b7:0ys0_A0BCEPaQk463eixUTlprEoiTfBO8JB_rS_ueRo	2024-12-19 02:28:09.662294+00
fq1j33uywmff9sv6e6wyw7hlxdwfvhgf	.eJxVjMEOwiAQBf-FsyEUqECP3v0GsmwXixpoSptojP-uJD3o9c28eTEP2zr5rdLi08gGJtnhdwuAN8oNjFfIl8Kx5HVJgTeF77Tycxnpftrdv8AEdfq-Vd93xhoClCZGE5UBGwRoESFoi6pXsnNRS3QOLYFQAbR20RxJogQFLVqp1lSyp8eclicbxPsDi0s_QA:1tECfq:09-dw8ZJnoQamve92w-woUaMF7H5epPxlEyubuTP428	2024-12-05 19:17:06.905119+00
9leev4acxdkulo60b3d6odvaiy31fvoy	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGMew:XGZt-UM3BLpVe9B13GjLwastQ2ERvx828icc4KjnoxI	2024-12-11 18:21:06.636514+00
19cjc8tqdgs1rllewaatyqakyi00en8s	.eJxVjEEOwiAQRe_C2hAptJQu3XsGMswMFjXQlDbRGO-uTbrQ7X_vv5fwsC6jXyvPPpEYhLLi8DsGwBvnjdAV8qVILHmZU5CbInda5bkQ30-7-xcYoY7fN_cE1MXotGkiaADEnpUGTc445chYoxBt07amUTEEih2StopRu2jBbdHKtaaSPT-mND_FcHx_APNaQEE:1tKMGW:0zwLXNsTCCV3rruxR0uNWptSbJuB68sPn4pZX1aVj-w	2024-12-22 18:44:24.131858+00
u7gva4jf0j5r3d21qdpqxd06hiohmbpk	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tJ7oE:8D_aEx5A7Jpnc0bTCsnLrniCKq7vB-yY9U6erw9QUYU	2024-12-19 09:06:06.29981+00
k8ey5gpgin74ts4ndmio7j736jmpnd1x	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGRBF:1cvUonWDVUopo4mXWkI-MZVKfqOmW4lTHMaLfrSiYWU	2024-12-11 23:10:45.203829+00
ze5hlgaj0blzzr3i7in9403roq00roz5	.eJxVjEEOwiAQRe_C2hAptJQu3XsGMswMFjXQlDbRGO-uTbrQ7X_vv5fwsC6jXyvPPpEYhLLi8DsGwBvnjdAV8qVILHmZU5CbInda5bkQ30-7-xcYoY7fN_cE1MXotGkiaADEnpUGTc445chYoxBt07amUTEEih2StopRu2jBbdHKtaaSPT-mND_FcHx_APNaQEE:1tKMNN:3tDfQm0iROu2d4Wy1Pr_UIlagfHLpMKSQz89dnD9_G0	2024-12-22 18:51:29.799163+00
5i97mx8hcva5fyoh2xb9pde3l5svtj69	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tJ83g:oN2XQLssHazXlA8-Ce_cxZkSamCID3Vq9OzwBUpPjVc	2024-12-19 09:22:04.788484+00
373tym878hu87idy9vu2huczrn4w8jry	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tEMI1:6yeaQk32vaUESnSVFmUhvIN8RG-RhBapP7Ua8OnIDnI	2024-12-06 05:33:09.602867+00
99jzj1gffpieuilu5vxadmg4nxyxx5br	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGV5A:MxCtdSJNkjSbVfXa-UXZHaRIC6C69w1gpsdEYjLn0Uo	2024-12-12 03:20:44.055527+00
s3pb82dl93gwfw46nbxjlx3nztjj3odt	.eJxVjEEOwiAQRe_C2hAptJQu3XsGMswMFjXQlDbRGO-uTbrQ7X_vv5fwsC6jXyvPPpEYhLLi8DsGwBvnjdAV8qVILHmZU5CbInda5bkQ30-7-xcYoY7fN_cE1MXotGkiaADEnpUGTc445chYoxBt07amUTEEih2StopRu2jBbdHKtaaSPT-mND_FcHx_APNaQEE:1tKMRL:gNa5gJVy_2PaLH05DkKT1Fuv4gFO2b9YqeoHeIEN074	2024-12-22 18:55:35.409002+00
ab5lnotyj3kqsiv07b1hwxzvayz0b1lm	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tEMIJ:-4b-93L5x3BknI2EFtYOdek4Y2YLBEqPIs-2owlHTUY	2024-12-06 05:33:27.760941+00
8hc7o60kiax4ivzxps9af1kvylcwlkpm	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tEa1m:Gj-rlQIVaoxgwNH5pVB30ylLRcWe3bhJJQIW7b0l-DQ	2024-12-06 20:13:18.758937+00
sv446plvcnqm4kvu19av0sdiwxb6ea6y	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tGVPw:Ep2Fy-hwR3-imThDdL20SObIz2L_JYyqe27m57K2_zc	2024-12-12 03:42:12.333887+00
ueq9s7hozbyzcna25pradmww21i32hwq	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tEdbv:BunLfLkXm3Zt2yoL4xeOSSLX7KvYynldEDWaX15MDww	2024-12-07 00:02:51.761708+00
ehdb9pe3wsegeph01y4n1mkc1ucrwu8n	.eJxVjMsOwiAUBf-FtSFQHtIu3fsN5AIXixpooE00xn9Xki50e2bOvIiFbZ3t1rDaFMhEODn8bg78DXMH4Qr5Uqgvea3J0a7QnTZ6LgHvp939C8zQ5u-bKS1QAioXIxotPZiBRym5BDFGjCJwGDwfRsGc5yowDaMw4I6ooxeG9WjD1lLJFh9Lqk8ysfcHnNw_YQ:1tKMRu:Pi0oIl2lfZxjLsbshxlVUKlIKoDGLUkN3i1OiOEqbd8	2024-12-22 18:56:10.405992+00
1brgdajakbt9fuzfnjrwree459p5cxj3	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tEdpg:qdp5Fv-e4CQ_4Q5_rdzqzCrXXnH38AS5XUYWI4ben0A	2024-12-07 00:17:04.84887+00
1utiuk2glf8hrhjhq9lfozwgfm3883ul	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tEhtE:emZ9y9VVaF-ehU4gNd9K4NcKGqhKSVbNJGfjx7bUwWE	2024-12-07 04:37:00.670962+00
2d2dq30h8kac4m15mqoeh8wtir6ltd1p	.eJxVjEsOAiEQBe_C2hC-aXDp3jMQoBsZNZAMMyvj3ZVkFrp9VfVeLMR9q2EftIYF2ZlJdvrdUswPahPgPbZb57m3bV0Snwo_6ODXjvS8HO7fQY2jfmvhCIgKGKeMtoVAJJu1yw5UsjoJb2ByIW1BicWjislYr8FJEoY0e38A36Q3tw:1tFE4Z:hZVkiQDCsYWPydqoRyKlMcYavcfxoODs4YGc6rIOnUc	2024-12-08 14:58:51.274978+00
v9yvaycpy8ly82h4vbqhesvufvzmyp0t	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFFI1:Bjbilo1vYScGLnUSGlcOx8wDSHoOSmxHfY_-Pvyo09I	2024-12-08 16:16:49.320548+00
izacumhegboaki45kjhn0xqn21h96ze2	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFJpa:Z1u3-rwRik2JxiCKMYWgcE310iBEv1wchgEtVEB7piI	2024-12-08 21:07:46.506601+00
u46yltuhofwtswnlux4s5he5isq3mg35	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFOlp:nqi9629dPv7TznB1_wrBCHXCcGcuiaUPWO_IO7ONV5U	2024-12-09 02:24:13.158686+00
qkymo9hxdbww4ruiw5exqz6lxi1fo2so	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFRLo:l9qvoyF_C4Eum4nANf4iMDevuBdh189Ssu1LW_D9i38	2024-12-09 05:09:32.830235+00
jvrljgt01itptu183xepjh8py58pi4sf	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFbj6:10Dud_kgLj9tQFoHPLgp9XbTduUt0GyKcgD7gA8_gp0	2024-12-09 16:14:16.97442+00
i4qajelq0fz6bdbwnr546p9vwlxkkc80	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFbpW:5NI2tOHEAC4Vf-ZAFag5vnwUIj2CV-RUI7nNZ9t1gS0	2024-12-09 16:20:54.332938+00
v60adb9741i8ares5arpv87y7ldqny6d	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFctK:63To90tThN62mwPI7tVkk_8dsvPDxsw3uvJZ4FItoNw	2024-12-09 17:28:54.967678+00
6i2lh99qb0b1i54ck4jip7q8ikdh0y4j	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFd5N:WCzCBgqBRu8q4TFkAzPGJ66s3DifJEBlibrMiy8S5uA	2024-12-09 17:41:21.938409+00
iou8alxwauq4igdri8waes691hug7fgp	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFiVh:O2f98E0R5xOf6n4jx737Ez-890oRLPFpwp9cXPxvZUg	2024-12-09 23:28:53.358859+00
7rwyhtnj64sk11wor6ms1nnf4qxqdtna	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFiVj:pO3D7HfS8j-5JxUGWQH8GVWykiB_SkVbbzqv3PS3NKg	2024-12-09 23:28:55.489286+00
478fkjub9scv25qiuqxc0klhvbxo9gxr	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFnqP:R16-lZXwy1n6m1xSZDwNZxp8lab5PEI3LwJqALkV_QY	2024-12-10 05:10:37.410537+00
h3rf7t19gzxbdhzpjk93cjbojc6ye4hg	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFz30:bhZBn0Z9Mlp2JH94VOgqdVFzVsoJz9z7iEtnE4gvmZM	2024-12-10 17:08:22.875965+00
mwi2ub50unm6nkcp301ci5pmumy5obqn	.eJxVjMsKAiEYRt_FdYhX1Fm27xnEy29aoaEzUETvXsIsavud850Xsm5bs90GdFsiWhBFh9_Nu3CFOkG8uHpuOLS69uLxVPBOBz61CLfj7v4Fshv5-yYaFEBSQjPBZQJFvAxcB62Yl9wTI9TkhMoUaUwmMueFNFxpCkQAn9EBY5RWLTzupT_RQt4fhEY-9A:1tFzZv:uwf_PTSaC8VcuMF501u_vmxNoJ8SbNId3P2k8uuojAM	2024-12-10 17:42:23.913836+00
\.


--
-- TOC entry 3700 (class 0 OID 16700)
-- Dependencies: 245
-- Data for Name: login_tokenrecuperacion; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_tokenrecuperacion (id, token, created_at, expires_at, used, user_id) FROM stdin;
1	5a415b44-c7ae-4bb0-9461-55b0012c1692	2024-10-27 04:41:05.962234+00	2024-10-28 04:41:05.962234+00	f	1
\.


--
-- TOC entry 3702 (class 0 OID 16771)
-- Dependencies: 247
-- Data for Name: login_usuario; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_usuario (id, "RutUsuario", "TipoUsuario", "EdadUsuario", "TelefonoUsuario", "FotoUsuario", user_id) FROM stdin;
15	21.111.111-2	Colaborador	21	\N	\N	17
14	21.111.111-1	Administrador	\N	\N	image/upload/v1733635283/usuarios/yfuysrxbndj5xy2lyeom.jpg	15
\.


--
-- TOC entry 3690 (class 0 OID 16552)
-- Dependencies: 235
-- Data for Name: social_auth_association; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_auth_association (id, server_url, handle, secret, issued, lifetime, assoc_type) FROM stdin;
\.


--
-- TOC entry 3692 (class 0 OID 16560)
-- Dependencies: 237
-- Data for Name: social_auth_code; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_auth_code (id, email, code, verified, "timestamp") FROM stdin;
\.


--
-- TOC entry 3694 (class 0 OID 16566)
-- Dependencies: 239
-- Data for Name: social_auth_nonce; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_auth_nonce (id, server_url, "timestamp", salt) FROM stdin;
\.


--
-- TOC entry 3698 (class 0 OID 16598)
-- Dependencies: 243
-- Data for Name: social_auth_partial; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_auth_partial (id, token, next_step, backend, "timestamp", data) FROM stdin;
\.


--
-- TOC entry 3696 (class 0 OID 16572)
-- Dependencies: 241
-- Data for Name: social_auth_usersocialauth; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.social_auth_usersocialauth (id, provider, uid, user_id, created, modified, extra_data) FROM stdin;
\.


--
-- TOC entry 3730 (class 0 OID 0)
-- Dependencies: 221
-- Name: auth_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_id_seq', 1, false);


--
-- TOC entry 3731 (class 0 OID 0)
-- Dependencies: 223
-- Name: auth_group_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_group_permissions_id_seq', 1, false);


--
-- TOC entry 3732 (class 0 OID 0)
-- Dependencies: 219
-- Name: auth_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_permission_id_seq', 120, true);


--
-- TOC entry 3733 (class 0 OID 0)
-- Dependencies: 227
-- Name: auth_user_groups_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_groups_id_seq', 1, false);


--
-- TOC entry 3734 (class 0 OID 0)
-- Dependencies: 225
-- Name: auth_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_id_seq', 17, true);


--
-- TOC entry 3735 (class 0 OID 0)
-- Dependencies: 229
-- Name: auth_user_user_permissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.auth_user_user_permissions_id_seq', 1, false);


--
-- TOC entry 3736 (class 0 OID 0)
-- Dependencies: 258
-- Name: dashboard_categoria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_categoria_id_seq', 6, true);


--
-- TOC entry 3737 (class 0 OID 0)
-- Dependencies: 260
-- Name: dashboard_cliente_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_cliente_id_seq', 12, true);


--
-- TOC entry 3738 (class 0 OID 0)
-- Dependencies: 252
-- Name: dashboard_envio_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_envio_id_seq', 29, true);


--
-- TOC entry 3739 (class 0 OID 0)
-- Dependencies: 250
-- Name: dashboard_factura_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_factura_id_seq', 50, true);


--
-- TOC entry 3740 (class 0 OID 0)
-- Dependencies: 254
-- Name: dashboard_herramienta_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_herramienta_id_seq', 20, true);


--
-- TOC entry 3741 (class 0 OID 0)
-- Dependencies: 256
-- Name: dashboard_material_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_material_id_seq', 33, true);


--
-- TOC entry 3742 (class 0 OID 0)
-- Dependencies: 268
-- Name: dashboard_perdidas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_perdidas_id_seq', 54, true);


--
-- TOC entry 3743 (class 0 OID 0)
-- Dependencies: 262
-- Name: dashboard_producto_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_producto_id_seq', 70, true);


--
-- TOC entry 3744 (class 0 OID 0)
-- Dependencies: 266
-- Name: dashboard_productomaterial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_productomaterial_id_seq', 10, true);


--
-- TOC entry 3745 (class 0 OID 0)
-- Dependencies: 248
-- Name: dashboard_proveedor_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_proveedor_id_seq', 71, true);


--
-- TOC entry 3746 (class 0 OID 0)
-- Dependencies: 264
-- Name: dashboard_ventas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.dashboard_ventas_id_seq', 69, true);


--
-- TOC entry 3747 (class 0 OID 0)
-- Dependencies: 231
-- Name: django_admin_log_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_admin_log_id_seq', 13, true);


--
-- TOC entry 3748 (class 0 OID 0)
-- Dependencies: 217
-- Name: django_content_type_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_content_type_id_seq', 30, true);


--
-- TOC entry 3749 (class 0 OID 0)
-- Dependencies: 215
-- Name: django_migrations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.django_migrations_id_seq', 126, true);


--
-- TOC entry 3750 (class 0 OID 0)
-- Dependencies: 244
-- Name: login_tokenrecuperacion_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_tokenrecuperacion_id_seq', 1, true);


--
-- TOC entry 3751 (class 0 OID 0)
-- Dependencies: 246
-- Name: login_usuario_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_usuario_id_seq', 15, true);


--
-- TOC entry 3752 (class 0 OID 0)
-- Dependencies: 234
-- Name: social_auth_association_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.social_auth_association_id_seq', 1, false);


--
-- TOC entry 3753 (class 0 OID 0)
-- Dependencies: 236
-- Name: social_auth_code_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.social_auth_code_id_seq', 1, false);


--
-- TOC entry 3754 (class 0 OID 0)
-- Dependencies: 238
-- Name: social_auth_nonce_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.social_auth_nonce_id_seq', 1, false);


--
-- TOC entry 3755 (class 0 OID 0)
-- Dependencies: 242
-- Name: social_auth_partial_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.social_auth_partial_id_seq', 1, false);


--
-- TOC entry 3756 (class 0 OID 0)
-- Dependencies: 240
-- Name: social_auth_usersocialauth_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.social_auth_usersocialauth_id_seq', 2, true);


--
-- TOC entry 3373 (class 2606 OID 16531)
-- Name: auth_group auth_group_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_name_key UNIQUE (name);


--
-- TOC entry 3378 (class 2606 OID 16462)
-- Name: auth_group_permissions auth_group_permissions_group_id_permission_id_0cd325b0_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_permission_id_0cd325b0_uniq UNIQUE (group_id, permission_id);


--
-- TOC entry 3381 (class 2606 OID 16431)
-- Name: auth_group_permissions auth_group_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3375 (class 2606 OID 16423)
-- Name: auth_group auth_group_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group
    ADD CONSTRAINT auth_group_pkey PRIMARY KEY (id);


--
-- TOC entry 3368 (class 2606 OID 16453)
-- Name: auth_permission auth_permission_content_type_id_codename_01ab375a_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_codename_01ab375a_uniq UNIQUE (content_type_id, codename);


--
-- TOC entry 3370 (class 2606 OID 16417)
-- Name: auth_permission auth_permission_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_pkey PRIMARY KEY (id);


--
-- TOC entry 3389 (class 2606 OID 16445)
-- Name: auth_user_groups auth_user_groups_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_pkey PRIMARY KEY (id);


--
-- TOC entry 3392 (class 2606 OID 16477)
-- Name: auth_user_groups auth_user_groups_user_id_group_id_94350c0c_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_group_id_94350c0c_uniq UNIQUE (user_id, group_id);


--
-- TOC entry 3383 (class 2606 OID 16437)
-- Name: auth_user auth_user_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_pkey PRIMARY KEY (id);


--
-- TOC entry 3395 (class 2606 OID 16451)
-- Name: auth_user_user_permissions auth_user_user_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_pkey PRIMARY KEY (id);


--
-- TOC entry 3398 (class 2606 OID 16491)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_permission_id_14a6b632_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_permission_id_14a6b632_uniq UNIQUE (user_id, permission_id);


--
-- TOC entry 3386 (class 2606 OID 16526)
-- Name: auth_user auth_user_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user
    ADD CONSTRAINT auth_user_username_key UNIQUE (username);


--
-- TOC entry 3472 (class 2606 OID 16999)
-- Name: dashboard_categoria dashboard_categoria_NombreCategoria_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_categoria
    ADD CONSTRAINT "dashboard_categoria_NombreCategoria_key" UNIQUE ("NombreCategoria");


--
-- TOC entry 3474 (class 2606 OID 16997)
-- Name: dashboard_categoria dashboard_categoria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_categoria
    ADD CONSTRAINT dashboard_categoria_pkey PRIMARY KEY (id);


--
-- TOC entry 3477 (class 2606 OID 17170)
-- Name: dashboard_cliente dashboard_cliente_RutCliente_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_cliente
    ADD CONSTRAINT "dashboard_cliente_RutCliente_key" UNIQUE ("RutCliente");


--
-- TOC entry 3480 (class 2606 OID 17007)
-- Name: dashboard_cliente dashboard_cliente_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_cliente
    ADD CONSTRAINT dashboard_cliente_pkey PRIMARY KEY (id);


--
-- TOC entry 3461 (class 2606 OID 16894)
-- Name: dashboard_envio dashboard_envio_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_envio
    ADD CONSTRAINT dashboard_envio_pkey PRIMARY KEY (id);


--
-- TOC entry 3457 (class 2606 OID 16844)
-- Name: dashboard_factura dashboard_factura_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_factura
    ADD CONSTRAINT dashboard_factura_pkey PRIMARY KEY (id);


--
-- TOC entry 3465 (class 2606 OID 16911)
-- Name: dashboard_herramienta dashboard_herramienta_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_herramienta
    ADD CONSTRAINT dashboard_herramienta_pkey PRIMARY KEY (id);


--
-- TOC entry 3469 (class 2606 OID 16920)
-- Name: dashboard_material dashboard_material_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_material
    ADD CONSTRAINT dashboard_material_pkey PRIMARY KEY (id);


--
-- TOC entry 3498 (class 2606 OID 17110)
-- Name: dashboard_perdidas dashboard_perdidas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_perdidas
    ADD CONSTRAINT dashboard_perdidas_pkey PRIMARY KEY (id);


--
-- TOC entry 3483 (class 2606 OID 17020)
-- Name: dashboard_producto dashboard_producto_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_producto
    ADD CONSTRAINT dashboard_producto_pkey PRIMARY KEY (id);


--
-- TOC entry 3490 (class 2606 OID 17076)
-- Name: dashboard_productomaterial dashboard_productomateri_Producto_id_Material_id_4199e459_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_productomaterial
    ADD CONSTRAINT "dashboard_productomateri_Producto_id_Material_id_4199e459_uniq" UNIQUE ("Producto_id", "Material_id");


--
-- TOC entry 3494 (class 2606 OID 17074)
-- Name: dashboard_productomaterial dashboard_productomaterial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_productomaterial
    ADD CONSTRAINT dashboard_productomaterial_pkey PRIMARY KEY (id);


--
-- TOC entry 3446 (class 2606 OID 16835)
-- Name: dashboard_proveedor dashboard_proveedor_MarcaProveedor_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_proveedor
    ADD CONSTRAINT "dashboard_proveedor_MarcaProveedor_key" UNIQUE ("MarcaProveedor");


--
-- TOC entry 3449 (class 2606 OID 16831)
-- Name: dashboard_proveedor dashboard_proveedor_NombreProveedor_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_proveedor
    ADD CONSTRAINT "dashboard_proveedor_NombreProveedor_key" UNIQUE ("NombreProveedor");


--
-- TOC entry 3452 (class 2606 OID 16833)
-- Name: dashboard_proveedor dashboard_proveedor_RutProveedor_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_proveedor
    ADD CONSTRAINT "dashboard_proveedor_RutProveedor_key" UNIQUE ("RutProveedor");


--
-- TOC entry 3454 (class 2606 OID 16829)
-- Name: dashboard_proveedor dashboard_proveedor_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_proveedor
    ADD CONSTRAINT dashboard_proveedor_pkey PRIMARY KEY (id);


--
-- TOC entry 3488 (class 2606 OID 17027)
-- Name: dashboard_ventas dashboard_ventas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_ventas
    ADD CONSTRAINT dashboard_ventas_pkey PRIMARY KEY (id);


--
-- TOC entry 3401 (class 2606 OID 16512)
-- Name: django_admin_log django_admin_log_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_pkey PRIMARY KEY (id);


--
-- TOC entry 3363 (class 2606 OID 16411)
-- Name: django_content_type django_content_type_app_label_model_76bd3d3b_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_app_label_model_76bd3d3b_uniq UNIQUE (app_label, model);


--
-- TOC entry 3365 (class 2606 OID 16409)
-- Name: django_content_type django_content_type_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_content_type
    ADD CONSTRAINT django_content_type_pkey PRIMARY KEY (id);


--
-- TOC entry 3361 (class 2606 OID 16403)
-- Name: django_migrations django_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_migrations
    ADD CONSTRAINT django_migrations_pkey PRIMARY KEY (id);


--
-- TOC entry 3405 (class 2606 OID 16539)
-- Name: django_session django_session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_session
    ADD CONSTRAINT django_session_pkey PRIMARY KEY (session_key);


--
-- TOC entry 3435 (class 2606 OID 16704)
-- Name: login_tokenrecuperacion login_tokenrecuperacion_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_tokenrecuperacion
    ADD CONSTRAINT login_tokenrecuperacion_pkey PRIMARY KEY (id);


--
-- TOC entry 3439 (class 2606 OID 16778)
-- Name: login_usuario login_usuario_RutUsuario_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_usuario
    ADD CONSTRAINT "login_usuario_RutUsuario_key" UNIQUE ("RutUsuario");


--
-- TOC entry 3441 (class 2606 OID 16776)
-- Name: login_usuario login_usuario_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_usuario
    ADD CONSTRAINT login_usuario_pkey PRIMARY KEY (id);


--
-- TOC entry 3443 (class 2606 OID 16780)
-- Name: login_usuario login_usuario_user_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_usuario
    ADD CONSTRAINT login_usuario_user_id_key UNIQUE (user_id);


--
-- TOC entry 3408 (class 2606 OID 16618)
-- Name: social_auth_association social_auth_association_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_auth_association
    ADD CONSTRAINT social_auth_association_pkey PRIMARY KEY (id);


--
-- TOC entry 3410 (class 2606 OID 16596)
-- Name: social_auth_association social_auth_association_server_url_handle_078befa2_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_auth_association
    ADD CONSTRAINT social_auth_association_server_url_handle_078befa2_uniq UNIQUE (server_url, handle);


--
-- TOC entry 3414 (class 2606 OID 16594)
-- Name: social_auth_code social_auth_code_email_code_801b2d02_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_auth_code
    ADD CONSTRAINT social_auth_code_email_code_801b2d02_uniq UNIQUE (email, code);


--
-- TOC entry 3416 (class 2606 OID 16629)
-- Name: social_auth_code social_auth_code_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_auth_code
    ADD CONSTRAINT social_auth_code_pkey PRIMARY KEY (id);


--
-- TOC entry 3419 (class 2606 OID 16641)
-- Name: social_auth_nonce social_auth_nonce_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_auth_nonce
    ADD CONSTRAINT social_auth_nonce_pkey PRIMARY KEY (id);


--
-- TOC entry 3421 (class 2606 OID 16584)
-- Name: social_auth_nonce social_auth_nonce_server_url_timestamp_salt_f6284463_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_auth_nonce
    ADD CONSTRAINT social_auth_nonce_server_url_timestamp_salt_f6284463_uniq UNIQUE (server_url, "timestamp", salt);


--
-- TOC entry 3430 (class 2606 OID 16650)
-- Name: social_auth_partial social_auth_partial_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_auth_partial
    ADD CONSTRAINT social_auth_partial_pkey PRIMARY KEY (id);


--
-- TOC entry 3423 (class 2606 OID 16663)
-- Name: social_auth_usersocialauth social_auth_usersocialauth_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_auth_usersocialauth
    ADD CONSTRAINT social_auth_usersocialauth_pkey PRIMARY KEY (id);


--
-- TOC entry 3425 (class 2606 OID 16580)
-- Name: social_auth_usersocialauth social_auth_usersocialauth_provider_uid_e6b5e668_uniq; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_auth_usersocialauth
    ADD CONSTRAINT social_auth_usersocialauth_provider_uid_e6b5e668_uniq UNIQUE (provider, uid);


--
-- TOC entry 3371 (class 1259 OID 16532)
-- Name: auth_group_name_a6ea08ec_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_name_a6ea08ec_like ON public.auth_group USING btree (name varchar_pattern_ops);


--
-- TOC entry 3376 (class 1259 OID 16473)
-- Name: auth_group_permissions_group_id_b120cbf9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_group_id_b120cbf9 ON public.auth_group_permissions USING btree (group_id);


--
-- TOC entry 3379 (class 1259 OID 16474)
-- Name: auth_group_permissions_permission_id_84c5c92e; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_group_permissions_permission_id_84c5c92e ON public.auth_group_permissions USING btree (permission_id);


--
-- TOC entry 3366 (class 1259 OID 16459)
-- Name: auth_permission_content_type_id_2f476e4b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_permission_content_type_id_2f476e4b ON public.auth_permission USING btree (content_type_id);


--
-- TOC entry 3387 (class 1259 OID 16489)
-- Name: auth_user_groups_group_id_97559544; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_group_id_97559544 ON public.auth_user_groups USING btree (group_id);


--
-- TOC entry 3390 (class 1259 OID 16488)
-- Name: auth_user_groups_user_id_6a12ed8b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_groups_user_id_6a12ed8b ON public.auth_user_groups USING btree (user_id);


--
-- TOC entry 3393 (class 1259 OID 16503)
-- Name: auth_user_user_permissions_permission_id_1fbb5f2c; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_permission_id_1fbb5f2c ON public.auth_user_user_permissions USING btree (permission_id);


--
-- TOC entry 3396 (class 1259 OID 16502)
-- Name: auth_user_user_permissions_user_id_a95ead1b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_user_permissions_user_id_a95ead1b ON public.auth_user_user_permissions USING btree (user_id);


--
-- TOC entry 3384 (class 1259 OID 16527)
-- Name: auth_user_username_6821ab7c_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX auth_user_username_6821ab7c_like ON public.auth_user USING btree (username varchar_pattern_ops);


--
-- TOC entry 3470 (class 1259 OID 17028)
-- Name: dashboard_categoria_NombreCategoria_61285a4c_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_categoria_NombreCategoria_61285a4c_like" ON public.dashboard_categoria USING btree ("NombreCategoria" varchar_pattern_ops);


--
-- TOC entry 3475 (class 1259 OID 17183)
-- Name: dashboard_cliente_RutCliente_11636e35_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_cliente_RutCliente_11636e35_like" ON public.dashboard_cliente USING btree ("RutCliente" varchar_pattern_ops);


--
-- TOC entry 3478 (class 1259 OID 17184)
-- Name: dashboard_cliente_Usuario_id_613c6260; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_cliente_Usuario_id_613c6260" ON public.dashboard_cliente USING btree ("Usuario_id");


--
-- TOC entry 3458 (class 1259 OID 16963)
-- Name: dashboard_envio_Factura_id_a9edae19; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_envio_Factura_id_a9edae19" ON public.dashboard_envio USING btree ("Factura_id");


--
-- TOC entry 3459 (class 1259 OID 16865)
-- Name: dashboard_envio_Proveedor_id_3225644b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_envio_Proveedor_id_3225644b" ON public.dashboard_envio USING btree ("Proveedor_id");


--
-- TOC entry 3455 (class 1259 OID 16850)
-- Name: dashboard_factura_Proveedor_id_4d36082d; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_factura_Proveedor_id_4d36082d" ON public.dashboard_factura USING btree ("Proveedor_id");


--
-- TOC entry 3462 (class 1259 OID 16926)
-- Name: dashboard_herramienta_Envio_id_89d4f68b; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_herramienta_Envio_id_89d4f68b" ON public.dashboard_herramienta USING btree ("Envio_id");


--
-- TOC entry 3463 (class 1259 OID 16955)
-- Name: dashboard_herramienta_Proveedor_id_1f51b131; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_herramienta_Proveedor_id_1f51b131" ON public.dashboard_herramienta USING btree ("Proveedor_id");


--
-- TOC entry 3466 (class 1259 OID 16932)
-- Name: dashboard_material_Envio_id_625ca601; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_material_Envio_id_625ca601" ON public.dashboard_material USING btree ("Envio_id");


--
-- TOC entry 3467 (class 1259 OID 16956)
-- Name: dashboard_material_Proveedor_id_a2b29926; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_material_Proveedor_id_a2b29926" ON public.dashboard_material USING btree ("Proveedor_id");


--
-- TOC entry 3495 (class 1259 OID 17121)
-- Name: dashboard_perdidas_Producto_id_eca3f5af; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_perdidas_Producto_id_eca3f5af" ON public.dashboard_perdidas USING btree ("Producto_id");


--
-- TOC entry 3496 (class 1259 OID 17122)
-- Name: dashboard_perdidas_Usuario_id_46635087; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_perdidas_Usuario_id_46635087" ON public.dashboard_perdidas USING btree ("Usuario_id");


--
-- TOC entry 3481 (class 1259 OID 17041)
-- Name: dashboard_producto_Categoria_id_b8e18bcb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_producto_Categoria_id_b8e18bcb" ON public.dashboard_producto USING btree ("Categoria_id");


--
-- TOC entry 3491 (class 1259 OID 17087)
-- Name: dashboard_productomaterial_Material_id_ab7173cf; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_productomaterial_Material_id_ab7173cf" ON public.dashboard_productomaterial USING btree ("Material_id");


--
-- TOC entry 3492 (class 1259 OID 17088)
-- Name: dashboard_productomaterial_Producto_id_53862e16; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_productomaterial_Producto_id_53862e16" ON public.dashboard_productomaterial USING btree ("Producto_id");


--
-- TOC entry 3444 (class 1259 OID 16838)
-- Name: dashboard_proveedor_MarcaProveedor_cb728bed_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_proveedor_MarcaProveedor_cb728bed_like" ON public.dashboard_proveedor USING btree ("MarcaProveedor" varchar_pattern_ops);


--
-- TOC entry 3447 (class 1259 OID 16836)
-- Name: dashboard_proveedor_NombreProveedor_10c431dc_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_proveedor_NombreProveedor_10c431dc_like" ON public.dashboard_proveedor USING btree ("NombreProveedor" varchar_pattern_ops);


--
-- TOC entry 3450 (class 1259 OID 16837)
-- Name: dashboard_proveedor_RutProveedor_37a1044b_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_proveedor_RutProveedor_37a1044b_like" ON public.dashboard_proveedor USING btree ("RutProveedor" varchar_pattern_ops);


--
-- TOC entry 3484 (class 1259 OID 17058)
-- Name: dashboard_ventas_Producto_id_28ac20d9; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_ventas_Producto_id_28ac20d9" ON public.dashboard_ventas USING btree ("Producto_id");


--
-- TOC entry 3485 (class 1259 OID 17059)
-- Name: dashboard_ventas_Usuario_id_90b9abaa; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "dashboard_ventas_Usuario_id_90b9abaa" ON public.dashboard_ventas USING btree ("Usuario_id");


--
-- TOC entry 3486 (class 1259 OID 17191)
-- Name: dashboard_ventas_cliente_id_b6e3d488; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX dashboard_ventas_cliente_id_b6e3d488 ON public.dashboard_ventas USING btree (cliente_id);


--
-- TOC entry 3399 (class 1259 OID 16523)
-- Name: django_admin_log_content_type_id_c4bce8eb; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_content_type_id_c4bce8eb ON public.django_admin_log USING btree (content_type_id);


--
-- TOC entry 3402 (class 1259 OID 16524)
-- Name: django_admin_log_user_id_c564eba6; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_admin_log_user_id_c564eba6 ON public.django_admin_log USING btree (user_id);


--
-- TOC entry 3403 (class 1259 OID 16541)
-- Name: django_session_expire_date_a5c62663; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_expire_date_a5c62663 ON public.django_session USING btree (expire_date);


--
-- TOC entry 3406 (class 1259 OID 16540)
-- Name: django_session_session_key_c0390e0f_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX django_session_session_key_c0390e0f_like ON public.django_session USING btree (session_key varchar_pattern_ops);


--
-- TOC entry 3436 (class 1259 OID 16710)
-- Name: login_tokenrecuperacion_user_id_bb1ed929; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX login_tokenrecuperacion_user_id_bb1ed929 ON public.login_tokenrecuperacion USING btree (user_id);


--
-- TOC entry 3437 (class 1259 OID 16792)
-- Name: login_usuario_RutUsuario_65c62f6e_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "login_usuario_RutUsuario_65c62f6e_like" ON public.login_usuario USING btree ("RutUsuario" varchar_pattern_ops);


--
-- TOC entry 3411 (class 1259 OID 16585)
-- Name: social_auth_code_code_a2393167; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX social_auth_code_code_a2393167 ON public.social_auth_code USING btree (code);


--
-- TOC entry 3412 (class 1259 OID 16586)
-- Name: social_auth_code_code_a2393167_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX social_auth_code_code_a2393167_like ON public.social_auth_code USING btree (code varchar_pattern_ops);


--
-- TOC entry 3417 (class 1259 OID 16609)
-- Name: social_auth_code_timestamp_176b341f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX social_auth_code_timestamp_176b341f ON public.social_auth_code USING btree ("timestamp");


--
-- TOC entry 3431 (class 1259 OID 16611)
-- Name: social_auth_partial_timestamp_50f2119f; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX social_auth_partial_timestamp_50f2119f ON public.social_auth_partial USING btree ("timestamp");


--
-- TOC entry 3432 (class 1259 OID 16606)
-- Name: social_auth_partial_token_3017fea3; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX social_auth_partial_token_3017fea3 ON public.social_auth_partial USING btree (token);


--
-- TOC entry 3433 (class 1259 OID 16607)
-- Name: social_auth_partial_token_3017fea3_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX social_auth_partial_token_3017fea3_like ON public.social_auth_partial USING btree (token varchar_pattern_ops);


--
-- TOC entry 3426 (class 1259 OID 16614)
-- Name: social_auth_usersocialauth_uid_796e51dc; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX social_auth_usersocialauth_uid_796e51dc ON public.social_auth_usersocialauth USING btree (uid);


--
-- TOC entry 3427 (class 1259 OID 16615)
-- Name: social_auth_usersocialauth_uid_796e51dc_like; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX social_auth_usersocialauth_uid_796e51dc_like ON public.social_auth_usersocialauth USING btree (uid varchar_pattern_ops);


--
-- TOC entry 3428 (class 1259 OID 16592)
-- Name: social_auth_usersocialauth_user_id_17d28448; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX social_auth_usersocialauth_user_id_17d28448 ON public.social_auth_usersocialauth USING btree (user_id);


--
-- TOC entry 3500 (class 2606 OID 16468)
-- Name: auth_group_permissions auth_group_permissio_permission_id_84c5c92e_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissio_permission_id_84c5c92e_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3501 (class 2606 OID 16463)
-- Name: auth_group_permissions auth_group_permissions_group_id_b120cbf9_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_group_permissions
    ADD CONSTRAINT auth_group_permissions_group_id_b120cbf9_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3499 (class 2606 OID 16454)
-- Name: auth_permission auth_permission_content_type_id_2f476e4b_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_permission
    ADD CONSTRAINT auth_permission_content_type_id_2f476e4b_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3502 (class 2606 OID 16483)
-- Name: auth_user_groups auth_user_groups_group_id_97559544_fk_auth_group_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_group_id_97559544_fk_auth_group_id FOREIGN KEY (group_id) REFERENCES public.auth_group(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3503 (class 2606 OID 16478)
-- Name: auth_user_groups auth_user_groups_user_id_6a12ed8b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_groups
    ADD CONSTRAINT auth_user_groups_user_id_6a12ed8b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3504 (class 2606 OID 16497)
-- Name: auth_user_user_permissions auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permi_permission_id_1fbb5f2c_fk_auth_perm FOREIGN KEY (permission_id) REFERENCES public.auth_permission(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3505 (class 2606 OID 16492)
-- Name: auth_user_user_permissions auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.auth_user_user_permissions
    ADD CONSTRAINT auth_user_user_permissions_user_id_a95ead1b_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3518 (class 2606 OID 17173)
-- Name: dashboard_cliente dashboard_cliente_Usuario_id_613c6260_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_cliente
    ADD CONSTRAINT "dashboard_cliente_Usuario_id_613c6260_fk_auth_user_id" FOREIGN KEY ("Usuario_id") REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3512 (class 2606 OID 16957)
-- Name: dashboard_envio dashboard_envio_Factura_id_a9edae19_fk_dashboard_factura_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_envio
    ADD CONSTRAINT "dashboard_envio_Factura_id_a9edae19_fk_dashboard_factura_id" FOREIGN KEY ("Factura_id") REFERENCES public.dashboard_factura(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3513 (class 2606 OID 16860)
-- Name: dashboard_envio dashboard_envio_Proveedor_id_3225644b_fk_dashboard_proveedor_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_envio
    ADD CONSTRAINT "dashboard_envio_Proveedor_id_3225644b_fk_dashboard_proveedor_id" FOREIGN KEY ("Proveedor_id") REFERENCES public.dashboard_proveedor(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3511 (class 2606 OID 16845)
-- Name: dashboard_factura dashboard_factura_Proveedor_id_4d36082d_fk_dashboard; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_factura
    ADD CONSTRAINT "dashboard_factura_Proveedor_id_4d36082d_fk_dashboard" FOREIGN KEY ("Proveedor_id") REFERENCES public.dashboard_proveedor(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3514 (class 2606 OID 16945)
-- Name: dashboard_herramienta dashboard_herramient_Proveedor_id_1f51b131_fk_dashboard; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_herramienta
    ADD CONSTRAINT "dashboard_herramient_Proveedor_id_1f51b131_fk_dashboard" FOREIGN KEY ("Proveedor_id") REFERENCES public.dashboard_proveedor(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3515 (class 2606 OID 16935)
-- Name: dashboard_herramienta dashboard_herramienta_Envio_id_89d4f68b_fk_dashboard_envio_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_herramienta
    ADD CONSTRAINT "dashboard_herramienta_Envio_id_89d4f68b_fk_dashboard_envio_id" FOREIGN KEY ("Envio_id") REFERENCES public.dashboard_envio(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3516 (class 2606 OID 16940)
-- Name: dashboard_material dashboard_material_Envio_id_625ca601_fk_dashboard_envio_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_material
    ADD CONSTRAINT "dashboard_material_Envio_id_625ca601_fk_dashboard_envio_id" FOREIGN KEY ("Envio_id") REFERENCES public.dashboard_envio(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3517 (class 2606 OID 16950)
-- Name: dashboard_material dashboard_material_Proveedor_id_a2b29926_fk_dashboard; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_material
    ADD CONSTRAINT "dashboard_material_Proveedor_id_a2b29926_fk_dashboard" FOREIGN KEY ("Proveedor_id") REFERENCES public.dashboard_proveedor(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3525 (class 2606 OID 17111)
-- Name: dashboard_perdidas dashboard_perdidas_Producto_id_eca3f5af_fk_dashboard; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_perdidas
    ADD CONSTRAINT "dashboard_perdidas_Producto_id_eca3f5af_fk_dashboard" FOREIGN KEY ("Producto_id") REFERENCES public.dashboard_producto(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3526 (class 2606 OID 17116)
-- Name: dashboard_perdidas dashboard_perdidas_Usuario_id_46635087_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_perdidas
    ADD CONSTRAINT "dashboard_perdidas_Usuario_id_46635087_fk_auth_user_id" FOREIGN KEY ("Usuario_id") REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3519 (class 2606 OID 17089)
-- Name: dashboard_producto dashboard_producto_Categoria_id_b8e18bcb_fk_dashboard; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_producto
    ADD CONSTRAINT "dashboard_producto_Categoria_id_b8e18bcb_fk_dashboard" FOREIGN KEY ("Categoria_id") REFERENCES public.dashboard_categoria(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3523 (class 2606 OID 17077)
-- Name: dashboard_productomaterial dashboard_productoma_Material_id_ab7173cf_fk_dashboard; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_productomaterial
    ADD CONSTRAINT "dashboard_productoma_Material_id_ab7173cf_fk_dashboard" FOREIGN KEY ("Material_id") REFERENCES public.dashboard_material(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3524 (class 2606 OID 17082)
-- Name: dashboard_productomaterial dashboard_productoma_Producto_id_53862e16_fk_dashboard; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_productomaterial
    ADD CONSTRAINT "dashboard_productoma_Producto_id_53862e16_fk_dashboard" FOREIGN KEY ("Producto_id") REFERENCES public.dashboard_producto(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3520 (class 2606 OID 17047)
-- Name: dashboard_ventas dashboard_ventas_Producto_id_28ac20d9_fk_dashboard_producto_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_ventas
    ADD CONSTRAINT "dashboard_ventas_Producto_id_28ac20d9_fk_dashboard_producto_id" FOREIGN KEY ("Producto_id") REFERENCES public.dashboard_producto(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3521 (class 2606 OID 17052)
-- Name: dashboard_ventas dashboard_ventas_Usuario_id_90b9abaa_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_ventas
    ADD CONSTRAINT "dashboard_ventas_Usuario_id_90b9abaa_fk_auth_user_id" FOREIGN KEY ("Usuario_id") REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3522 (class 2606 OID 17186)
-- Name: dashboard_ventas dashboard_ventas_cliente_id_b6e3d488_fk_dashboard_cliente_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.dashboard_ventas
    ADD CONSTRAINT dashboard_ventas_cliente_id_b6e3d488_fk_dashboard_cliente_id FOREIGN KEY (cliente_id) REFERENCES public.dashboard_cliente(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3506 (class 2606 OID 16513)
-- Name: django_admin_log django_admin_log_content_type_id_c4bce8eb_fk_django_co; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_content_type_id_c4bce8eb_fk_django_co FOREIGN KEY (content_type_id) REFERENCES public.django_content_type(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3507 (class 2606 OID 16518)
-- Name: django_admin_log django_admin_log_user_id_c564eba6_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.django_admin_log
    ADD CONSTRAINT django_admin_log_user_id_c564eba6_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3509 (class 2606 OID 16705)
-- Name: login_tokenrecuperacion login_tokenrecuperacion_user_id_bb1ed929_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_tokenrecuperacion
    ADD CONSTRAINT login_tokenrecuperacion_user_id_bb1ed929_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3510 (class 2606 OID 16787)
-- Name: login_usuario login_usuario_user_id_ad428b97_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_usuario
    ADD CONSTRAINT login_usuario_user_id_ad428b97_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


--
-- TOC entry 3508 (class 2606 OID 16587)
-- Name: social_auth_usersocialauth social_auth_usersocialauth_user_id_17d28448_fk_auth_user_id; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.social_auth_usersocialauth
    ADD CONSTRAINT social_auth_usersocialauth_user_id_17d28448_fk_auth_user_id FOREIGN KEY (user_id) REFERENCES public.auth_user(id) DEFERRABLE INITIALLY DEFERRED;


-- Completed on 2024-12-08 21:11:28

--
-- PostgreSQL database dump complete
--


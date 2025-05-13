--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: update_bookings_timestamp_function(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_bookings_timestamp_function() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_bookings_timestamp_function() OWNER TO postgres;

--
-- Name: update_categories_timestamp_function(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_categories_timestamp_function() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_categories_timestamp_function() OWNER TO postgres;

--
-- Name: update_events_timestamp_function(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_events_timestamp_function() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_events_timestamp_function() OWNER TO postgres;

--
-- Name: update_users_timestamp_function(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.update_users_timestamp_function() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.update_users_timestamp_function() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bookings; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bookings (
    booking_id integer NOT NULL,
    event_id integer NOT NULL,
    user_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.bookings OWNER TO postgres;

--
-- Name: bookings_booking_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bookings_booking_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.bookings_booking_id_seq OWNER TO postgres;

--
-- Name: bookings_booking_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bookings_booking_id_seq OWNED BY public.bookings.booking_id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    category_id integer NOT NULL,
    name character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_category_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_category_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_category_id_seq OWNER TO postgres;

--
-- Name: categories_category_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_category_id_seq OWNED BY public.categories.category_id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    event_id integer NOT NULL,
    title character varying(255) NOT NULL,
    description text,
    location character varying(255) NOT NULL,
    "time" timestamp without time zone NOT NULL,
    capacity integer NOT NULL,
    price numeric(10,2) NOT NULL,
    category_id integer NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT events_capacity_check CHECK ((capacity > 0)),
    CONSTRAINT events_price_check CHECK ((price >= (0)::numeric))
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_event_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_event_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_event_id_seq OWNER TO postgres;

--
-- Name: events_event_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_event_id_seq OWNED BY public.events.event_id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    user_id integer NOT NULL,
    name character varying(255) NOT NULL,
    email character varying(255) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role character varying(10) DEFAULT 'user'::character varying
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_user_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_user_id_seq OWNER TO postgres;

--
-- Name: users_user_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_user_id_seq OWNED BY public.users.user_id;


--
-- Name: bookings booking_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings ALTER COLUMN booking_id SET DEFAULT nextval('public.bookings_booking_id_seq'::regclass);


--
-- Name: categories category_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN category_id SET DEFAULT nextval('public.categories_category_id_seq'::regclass);


--
-- Name: events event_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN event_id SET DEFAULT nextval('public.events_event_id_seq'::regclass);


--
-- Name: users user_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN user_id SET DEFAULT nextval('public.users_user_id_seq'::regclass);


--
-- Data for Name: bookings; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bookings (booking_id, event_id, user_id, created_at, updated_at) FROM stdin;
1	13	1	2025-04-05 14:35:09.196349	2025-04-05 14:35:09.196349
2	13	1	2025-04-05 15:20:20.163972	2025-04-05 15:20:20.163972
3	13	1	2025-04-05 15:35:14.504674	2025-04-05 15:35:14.504674
4	13	2	2025-04-05 15:40:12.59608	2025-04-05 15:40:12.59608
5	13	2	2025-04-05 17:04:17.207801	2025-04-05 17:04:17.207801
6	13	2	2025-04-05 17:16:58.136216	2025-04-05 17:16:58.136216
7	13	2	2025-04-05 18:15:00.947289	2025-04-05 18:15:00.947289
8	13	2	2025-04-05 18:36:13.98486	2025-04-05 18:36:13.98486
9	13	2	2025-04-05 18:38:47.819355	2025-04-05 18:38:47.819355
10	13	2	2025-04-05 18:54:13.544158	2025-04-05 18:54:13.544158
11	13	2	2025-04-05 19:07:48.983158	2025-04-05 19:07:48.983158
12	13	2	2025-04-05 19:24:34.624114	2025-04-05 19:24:34.624114
13	13	3	2025-04-05 19:39:27.77606	2025-04-05 19:39:27.77606
14	13	3	2025-04-06 12:47:22.210426	2025-04-06 12:47:22.210426
15	13	3	2025-04-06 12:50:08.635022	2025-04-06 12:50:08.635022
16	13	3	2025-04-06 13:01:29.356994	2025-04-06 13:01:29.356994
17	13	3	2025-04-06 13:14:08.128048	2025-04-06 13:14:08.128048
18	13	3	2025-04-06 13:17:23.242702	2025-04-06 13:17:23.242702
19	13	3	2025-04-06 13:34:32.944427	2025-04-06 13:34:32.944427
20	13	3	2025-04-06 13:35:08.881523	2025-04-06 13:35:08.881523
21	13	3	2025-04-06 13:40:00.624775	2025-04-06 13:40:00.624775
22	13	3	2025-04-06 13:42:12.769379	2025-04-06 13:42:12.769379
23	13	3	2025-04-06 13:43:15.346756	2025-04-06 13:43:15.346756
24	13	3	2025-04-06 13:50:21.782173	2025-04-06 13:50:21.782173
25	13	3	2025-04-07 13:55:21.516715	2025-04-07 13:55:21.516715
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (category_id, name, created_at, updated_at) FROM stdin;
13	Computer science	2025-04-05 02:15:17.48743	2025-04-05 02:15:17.48743
14	aliza	2025-04-05 02:29:11.727337	2025-04-05 02:29:11.727337
15	abdullah	2025-04-05 02:29:24.149233	2025-04-05 02:29:24.149233
16	daniyal	2025-04-05 02:40:02.972353	2025-04-05 02:40:02.972353
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (event_id, title, description, location, "time", capacity, price, category_id, created_at, updated_at) FROM stdin;
13	My First Event	This is just a test event	Lahore	2025-05-01 18:00:00	100	49.99	13	2025-04-05 11:43:38.926888	2025-04-05 11:43:38.926888
14	Tech Future Expo	Technology ka future explore karein	Lahore	2025-07-01 10:00:00	200	250.00	14	2025-04-05 12:41:27.619538	2025-04-05 12:41:27.619538
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (user_id, name, email, password, created_at, updated_at, role) FROM stdin;
1	John Doe	john@example.com	password123	2025-04-04 01:55:50.348001	2025-04-04 01:55:50.348001	user
2	Jane Smith	jane@example.com	password456	2025-04-04 01:55:50.348001	2025-04-04 01:55:50.348001	user
3	Alice Johnson	alice@example.com	password789	2025-04-04 01:55:50.348001	2025-04-04 01:55:50.348001	user
4	Ali Raza	ali@example.com	$2b$10$pHayGS93KfG7CpNmANO2AevaZiOJZfMlVBCqUsyI8yK1Dky19ahAe	2025-04-17 23:38:45.782649	2025-04-17 23:38:45.782649	user
5	Aliza Faisal	aliza7729@gmail.com	$2b$10$kot/8EpGt/28OjlM.5VaQ.web3094qPf679zHpQK6tMxBqSLmsnR.	2025-04-17 23:46:33.040776	2025-04-17 23:46:33.040776	user
6	Awais	awais@example.com	$2b$10$G9v9aVSfHM0TCT94F9ykyuTHQQkX1d5jEW66EfiKu26V4G8g.rd1W	2025-04-18 11:20:52.333893	2025-04-18 11:20:52.333893	user
7	Alina	alina@example.com	$2b$10$OPamKnu/FOAw.qY/aTjAAO1w5OGcbf60NTCE8AbYmKUl9.tLxOe6.	2025-04-18 11:23:05.221835	2025-04-18 11:23:05.221835	admin
9	Ayeza	ayeza@example.com	$2b$10$U3IOWzEbNzEg0soInmF93.a0WAtAWwfYHKL1B9ZsRY1oMvg3ykBGi	2025-04-18 11:28:07.497556	2025-04-18 11:28:07.497556	admin
13	Alia	aliaali@example.com	$2b$10$8rALnkzaLpftWlyMt6fioe1qNSL75.9XzljlmoPGJPJ9ft2gjrlvG	2025-04-18 13:18:42.924424	2025-04-18 13:18:42.924424	admin
14	eman	eman@example.com	$2b$10$P4FBcYFBgmQxT0kfk1/2nu1OyoBZ4feTEWEXhENlhBaWNrar4nkky	2025-04-18 13:53:50.679159	2025-04-18 13:53:50.679159	user
15	Aliyar	aliyar@example.com	$2b$10$oi6TGU7cw/SSdJC/fpmUauQV7Ipo/TGoFsmu.ZZTXPLX7gwmhg8Z6	2025-04-18 15:44:10.708023	2025-04-18 15:44:10.708023	admin
16	Noor	Noor@example.com	$2b$10$ksZjaPaapnqvQ7DqVBLTruTIZ5gZ2mP0ltfMHbXqyG3L.cXCec9qu	2025-04-18 15:51:00.838257	2025-04-18 15:51:00.838257	admin
17	erum	erum@example.com	$2b$10$YKBoPcMT5AxcyXAb7izTmu5G4cAtWbT56hPsY0R3hpFIv3A7DkMxe	2025-04-18 15:51:31.435918	2025-04-18 15:51:31.435918	user
18	Test	test@example.com	$2b$10$kf2U.g4zaF1I7eJqXyJFNOedxQH.0KVbbPspD6vkUx0n36SaFGDJS	2025-04-18 16:58:39.082011	2025-04-18 16:58:39.082011	admin
19	Test	test1@example.com	$2b$10$A5XGCmWiTDi6DWTYWUBFPeSAHJ7G52I2/XMlM3IBrmHYnv3GwVSqK	2025-04-18 16:59:30.080411	2025-04-18 16:59:30.080411	admin
20	erum	erum1@example.com	$2b$10$bzFT03K5UUa2ea3t8VHa1.t.cgVmwtf6oqQx1myM7RUwd3TcP0bZq	2025-04-18 17:02:25.111471	2025-04-18 17:02:25.111471	user
\.


--
-- Name: bookings_booking_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bookings_booking_id_seq', 25, true);


--
-- Name: categories_category_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_category_id_seq', 16, true);


--
-- Name: events_event_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_event_id_seq', 14, true);


--
-- Name: users_user_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_user_id_seq', 20, true);


--
-- Name: bookings bookings_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_pkey PRIMARY KEY (booking_id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (category_id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (event_id);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (user_id);


--
-- Name: bookings update_bookings_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_bookings_timestamp BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_bookings_timestamp_function();


--
-- Name: categories update_categories_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_categories_timestamp BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.update_categories_timestamp_function();


--
-- Name: events update_events_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_events_timestamp BEFORE UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_events_timestamp_function();


--
-- Name: users update_users_timestamp; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER update_users_timestamp BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION public.update_users_timestamp_function();


--
-- Name: bookings bookings_event_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(event_id) ON DELETE CASCADE;


--
-- Name: bookings bookings_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bookings
    ADD CONSTRAINT bookings_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(user_id) ON DELETE CASCADE;


--
-- Name: events events_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(category_id) ON DELETE CASCADE;


--
-- PostgreSQL database dump complete
--


-- REPLACE skillswap with the DB_NAME! Otherwise data will go  to postgres
\connect skillswap
--
-- PostgreSQL database dump
--

-- Dumped from database version 17.5 (Debian 17.5-1.pgdg120+1)
-- Dumped by pg_dump version 17.5 (Debian 17.5-1.pgdg120+1)

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
-- Name: user_gender_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_gender_enum AS ENUM (
    'male',
    'female'
);


ALTER TYPE public.user_gender_enum OWNER TO postgres;

--
-- Name: user_role_enum; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.user_role_enum AS ENUM (
    'ADMIN',
    'USER'
);


ALTER TYPE public.user_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    age integer NOT NULL,
    city text NOT NULL,
    gender public.user_gender_enum NOT NULL,
    avatar text NOT NULL,
    role public.user_role_enum NOT NULL,
    "refreshToken" character varying(255) NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, name, email, password, age, city, gender, avatar, role, "refreshToken") FROM stdin;
92b8a2a7-ab6b-4fa9-915b-d27945865e39	Jane Doe	janedoe@mail.com	$2b$10$KaVaAuk2h7zTvoZMMon7E.Oalv82rifj09Fmr5XHLfofHOX14oKlS	25	St. Petersburg	female	link/to/avatar.jpg	USER	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI5MmI4YTJhNy1hYjZiLTRmYTktOTE1Yi1kMjc5NDU4NjVlMzkiLCJpYXQiOjE3NTI5ODI1MjYsImV4cCI6MTc1Mjk4NjEyNn0.Rl2k8h_jIwlgHwrP3Aiwl1nGeOXNHZ-hoE__PLbNvkA
0354a762-8928-427f-81d7-1656f717f39c	John Doe	johndoe@mail.com	$2b$10$pCHdOHoXp7sP0zPWuk05sujC4tDdB5Z1ZqVi7rIPS8KxvBQh9UFmy	30	Moscow	male	link/to/avatar.jpg	ADMIN	eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIwMzU0YTc2Mi04OTI4LTQyN2YtODFkNy0xNjU2ZjcxN2YzOWMiLCJpYXQiOjE3NTI5ODQ1MzgsImV4cCI6MTc1Mjk4ODEzOH0.CWT12NF803dfSCrGYC8DLpdd6QWlHOwUhjS0cCh-dsU
\.


--
-- Name: user PK_cace4a159ff9f2512dd42373760; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY (id);


--
-- Name: user UQ_03585d421deb10bbc326fffe4c1; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public."user"
    ADD CONSTRAINT "UQ_03585d421deb10bbc326fffe4c1" UNIQUE ("refreshToken");


--
-- PostgreSQL database dump complete
--


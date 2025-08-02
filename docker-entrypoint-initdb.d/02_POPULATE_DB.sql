--Здесь нужно вручную задать название БД. Это значение есть в .env файле под названием db_name
\connect skillswap

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
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


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
    'user',
    'admin'
);


ALTER TYPE public.user_role_enum OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.category (
    id uuid DEFAULT public.uuid_generate_v4() NOT NULL,
    name character varying(100) NOT NULL,
    "parentId" uuid
);


ALTER TABLE public.category OWNER TO postgres;

--
-- Name: skill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.skill (
    id uuid NOT NULL,
    title character varying(100) NOT NULL,
    description text,
    "ownerId" uuid,
    images text[],
    "categoryId" uuid
);


ALTER TABLE public.skill OWNER TO postgres;

--
-- Name: user; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public."user" (
    id uuid NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password text NOT NULL,
    about text,
    age integer,
    city text,
    gender public.user_gender_enum,
    avatar text,
    role public.user_role_enum DEFAULT 'user'::public.user_role_enum NOT NULL,
    "refreshToken" character varying(255) NOT NULL
);


ALTER TABLE public."user" OWNER TO postgres;

--
-- Name: user_favorite_skills_skill; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_favorite_skills_skill (
    "userId" uuid NOT NULL,
    "skillId" uuid NOT NULL
);


ALTER TABLE public.user_favorite_skills_skill OWNER TO postgres;

--
-- Name: user_want_to_learn_category; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.user_want_to_learn_category (
    "userId" uuid NOT NULL,
    "categoryId" uuid NOT NULL
);


ALTER TABLE public.user_want_to_learn_category OWNER TO postgres;

--
-- Data for Name: category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.category (id, name, "parentId") FROM stdin;
1234b762-8928-427f-81d7-1656f717f39c	Common Parent Cateory	\N
0354a762-8928-427f-81d7-1656f717f39c	John's skill category	1234b762-8928-427f-81d7-1656f717f39c
92b8a2a7-ab6b-4fa9-915b-d27945865e39	Jane's Skill Category	1234b762-8928-427f-81d7-1656f717f39c
\.


--
-- Data for Name: skill; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.skill (id, title, description, "ownerId", images, "categoryId") FROM stdin;
92b8a2a7-ab6b-4fa9-915b-d27945865e39	Jane`s Skill	It's Jane Doe's skill.	92b8a2a7-ab6b-4fa9-915b-d27945865e39	{'/link/to/skill.jpg'}	92b8a2a7-ab6b-4fa9-915b-d27945865e39
0354a762-8928-427f-81d7-1656f717f39c	John's Skill	John's skills are very valuable!	0354a762-8928-427f-81d7-1656f717f39c	{'/link/to/skill2.jpg'}	0354a762-8928-427f-81d7-1656f717f39c
\.


--
-- Data for Name: user; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public."user" (id, name, email, password, about, age, city, gender, avatar, role, "refreshToken") FROM stdin;
0354a762-8928-427f-81d7-1656f717f19c	Max Pein	max.pein@mail.com	$2b$12$examplehashstring1234567890abcdef	John Doe is your average John Doe.	30	Moscow	male	link/to/JohnDoe.jpg	admin	tokenOfSecretSecrets1
0354a762-8928-427f-81d7-1656f717f39c	John Doe	johndoe@mail.com	$2b$10$pCHdOHoXp7sP0zPWuk05sujC4tDdB5Z1ZqVi7rIPS8KxvBQh9UFmy	John Doe is your average John Doe.	30	Moscow	male	link/to/JohnDoe.jpg	user	tokenOfSecretSecrets2
92b8a2a7-ab6b-4fa9-915b-d27945865e39	Jane Doe	janedoe@mail.com	$2b$10$KaVaAuk2h7zTvoZMMon7E.Oalv82rifj09Fmr5XHLfofHOX14oKlS	Jane Doe is a token mock female user.	27	St. Petersburg	female	link/to/JaneDoe.jpg	user	superSecretToken
\.


--
-- Data for Name: user_favorite_skills_skill; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_favorite_skills_skill ("userId", "skillId") FROM stdin;
0354a762-8928-427f-81d7-1656f717f39c	0354a762-8928-427f-81d7-1656f717f39c
92b8a2a7-ab6b-4fa9-915b-d27945865e39	92b8a2a7-ab6b-4fa9-915b-d27945865e39
\.


--
-- Data for Name: user_want_to_learn_category; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.user_want_to_learn_category ("userId", "categoryId") FROM stdin;
0354a762-8928-427f-81d7-1656f717f39c	92b8a2a7-ab6b-4fa9-915b-d27945865e39
92b8a2a7-ab6b-4fa9-915b-d27945865e39	0354a762-8928-427f-81d7-1656f717f39c
\.


--
-- Name: user_want_to_learn_category PK_3a11aa3d614ae98f9096201ba99; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_want_to_learn_category
    ADD CONSTRAINT "PK_3a11aa3d614ae98f9096201ba99" PRIMARY KEY ("userId", "categoryId");


--
-- Name: user_favorite_skills_skill PK_4591b04d49d8f1279a7f16e459b; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorite_skills_skill
    ADD CONSTRAINT "PK_4591b04d49d8f1279a7f16e459b" PRIMARY KEY ("userId", "skillId");


--
-- Name: category PK_9c4e4a89e3674fc9f382d733f03; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT "PK_9c4e4a89e3674fc9f382d733f03" PRIMARY KEY (id);


--
-- Name: skill PK_a0d33334424e64fb78dc3ce7196; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill
    ADD CONSTRAINT "PK_a0d33334424e64fb78dc3ce7196" PRIMARY KEY (id);


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
-- Name: IDX_2447914b111b14e825c03b3159; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_2447914b111b14e825c03b3159" ON public.user_favorite_skills_skill USING btree ("userId");


--
-- Name: IDX_8200d2e5006ee95912f3e31b8a; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_8200d2e5006ee95912f3e31b8a" ON public.user_want_to_learn_category USING btree ("categoryId");


--
-- Name: IDX_b27f75d42117b7c773bcd2d779; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_b27f75d42117b7c773bcd2d779" ON public.user_favorite_skills_skill USING btree ("skillId");


--
-- Name: IDX_d6caeb3556e54ca7b078f26756; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_d6caeb3556e54ca7b078f26756" ON public.user_want_to_learn_category USING btree ("userId");


--
-- Name: user_favorite_skills_skill FK_2447914b111b14e825c03b31590; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorite_skills_skill
    ADD CONSTRAINT "FK_2447914b111b14e825c03b31590" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: user_want_to_learn_category FK_8200d2e5006ee95912f3e31b8a0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_want_to_learn_category
    ADD CONSTRAINT "FK_8200d2e5006ee95912f3e31b8a0" FOREIGN KEY ("categoryId") REFERENCES public.category(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: skill FK_ae50007dd0ddc9050deaa92185b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill
    ADD CONSTRAINT "FK_ae50007dd0ddc9050deaa92185b" FOREIGN KEY ("categoryId") REFERENCES public.category(id);


--
-- Name: user_favorite_skills_skill FK_b27f75d42117b7c773bcd2d779b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_favorite_skills_skill
    ADD CONSTRAINT "FK_b27f75d42117b7c773bcd2d779b" FOREIGN KEY ("skillId") REFERENCES public.skill(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: category FK_d5456fd7e4c4866fec8ada1fa10; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.category
    ADD CONSTRAINT "FK_d5456fd7e4c4866fec8ada1fa10" FOREIGN KEY ("parentId") REFERENCES public.category(id);


--
-- Name: user_want_to_learn_category FK_d6caeb3556e54ca7b078f26756b; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.user_want_to_learn_category
    ADD CONSTRAINT "FK_d6caeb3556e54ca7b078f26756b" FOREIGN KEY ("userId") REFERENCES public."user"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: skill FK_ed56eae08a494394cbab254bf56; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.skill
    ADD CONSTRAINT "FK_ed56eae08a494394cbab254bf56" FOREIGN KEY ("ownerId") REFERENCES public."user"(id);




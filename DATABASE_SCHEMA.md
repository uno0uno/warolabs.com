=== DATABASE SCHEMA (Complete DDL) ===

-- Schemas
CREATE SCHEMA IF NOT EXISTS drizzle;
CREATE SCHEMA IF NOT EXISTS public;


-- Tables
CREATE TABLE drizzle.__drizzle_migrations (
    id integer DEFAULT nextval('drizzle.__drizzle_migrations_id_seq'::regclass) NOT NULL,
    hash text NOT NULL,
    created_at bigint
);

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);

CREATE TABLE public.addresses (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    address_line1 character varying(255) NOT NULL,
    address_line2 character varying(255),
    city character varying(100) NOT NULL,
    state character varying(100),
    postal_code character varying(20),
    country character varying(100) NOT NULL,
    address_type character varying(50) NOT NULL,
    is_default boolean DEFAULT false NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.areas (
    id integer DEFAULT nextval('areas_id_seq'::regclass) NOT NULL,
    cluster_id integer NOT NULL,
    area_name character varying(255) NOT NULL,
    description text,
    capacity integer NOT NULL,
    price numeric(10,2) DEFAULT 0.00 NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying,
    status character varying(50) DEFAULT 'available'::character varying,
    extra_attributes jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    nomenclature_letter character varying(2),
    unit_capacity integer,
    service double precision,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.articles (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    thumbnail text NOT NULL,
    content text NOT NULL,
    slug text NOT NULL,
    published boolean NOT NULL,
    draft boolean NOT NULL,
    author uuid NOT NULL,
    is_active boolean NOT NULL,
    tags text NOT NULL,
    meta_descripcion text NOT NULL,
    cover text NOT NULL,
    views numeric,
    planet text NOT NULL,
    country text NOT NULL,
    city text NOT NULL,
    lang text NOT NULL,
    id_profile uuid NOT NULL,
    meta_title text NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.campaign (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    status character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    profile_id uuid NOT NULL,
    slug character varying(255)
);

CREATE TABLE public.campaign_leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    campaign_id uuid NOT NULL,
    lead_id uuid NOT NULL,
    joined_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.campaign_template_versions (
    campaign_id uuid NOT NULL,
    template_version_id uuid NOT NULL
);

CREATE TABLE public.cancellations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    reservation_id uuid NOT NULL,
    cancellation_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    reason text,
    refunded boolean DEFAULT false
);

CREATE TABLE public.categories (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    sequential_id bigint DEFAULT nextval('categories_sequential_id_seq'::regclass) NOT NULL
);

CREATE TABLE public.cluster_images (
    id integer DEFAULT nextval('cluster_images_id_seq'::regclass) NOT NULL,
    cluster_id integer NOT NULL,
    image_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    type_image character varying(50)
);

CREATE TABLE public.clusters (
    id integer DEFAULT nextval('clusters_id_seq'::regclass) NOT NULL,
    profile_id uuid NOT NULL,
    cluster_name character varying(255) NOT NULL,
    description text,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    cluster_type character varying(50),
    extra_attributes jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    is_active boolean DEFAULT true,
    shadowban boolean DEFAULT false,
    slug_cluster text NOT NULL,
    legal_info_id integer,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.commentable_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    comment_id uuid NOT NULL,
    item_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    item_type character varying(50)
);

CREATE TABLE public.comments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    comment text NOT NULL,
    emotion_emoji text,
    profile_id uuid NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    shadowban boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone
);

CREATE TABLE public.email_clicks (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    lead_id uuid NOT NULL,
    campaign_id uuid NOT NULL,
    original_url text NOT NULL,
    clicked_at timestamp with time zone DEFAULT now(),
    ip_address text,
    user_agent text
);

CREATE TABLE public.email_opens (
    id uuid DEFAULT uuid_generate_v4() NOT NULL,
    lead_id uuid NOT NULL,
    campaign_id uuid NOT NULL,
    opened_at timestamp with time zone DEFAULT now(),
    ip_address text,
    user_agent text
);

CREATE TABLE public.images (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    path character varying(500) NOT NULL,
    mime_type character varying(100),
    size bigint,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.inventory_transactions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    variant_id uuid NOT NULL,
    transaction_type character varying(50) NOT NULL,
    quantity_change integer NOT NULL,
    transaction_date timestamp with time zone DEFAULT now() NOT NULL,
    source character varying(100) NOT NULL,
    reference_id uuid,
    created_by uuid,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.leads (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    profile_id uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    converted_at timestamp with time zone,
    source character varying(100),
    medium character varying(100),
    campaign character varying(255),
    term character varying(255),
    content character varying(255),
    referrer_url text,
    ip_address inet,
    user_agent text,
    is_verified boolean DEFAULT false,
    verification_token text
);

CREATE TABLE public.legal_info (
    id integer DEFAULT nextval('legal_info_id_seq'::regclass) NOT NULL,
    nit character varying(20),
    legal_name character varying(150),
    puleb_code character varying(50),
    address character varying(255),
    city character varying(100),
    country character varying(100)
);

CREATE TABLE public.magic_tokens (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    token text NOT NULL,
    expires_at timestamp with time zone NOT NULL
);

CREATE TABLE public.module_tools (
    id uuid NOT NULL,
    module_id uuid NOT NULL,
    tool_id uuid NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.modules (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    slug text NOT NULL,
    is_active text DEFAULT 'true'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.order_items (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    variant_id uuid NOT NULL,
    quantity integer NOT NULL,
    price_at_purchase numeric(10,2) NOT NULL,
    subtotal numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_sale_stage_id uuid,
    applied_promotion_id uuid
);

CREATE TABLE public.order_status_history (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    order_id uuid NOT NULL,
    old_status character varying(50),
    new_status character varying(50) NOT NULL,
    change_date timestamp with time zone DEFAULT now() NOT NULL,
    changed_by uuid,
    reason text,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.orders (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    order_date timestamp with time zone DEFAULT now() NOT NULL,
    total_amount numeric(10,2) NOT NULL,
    status character varying(50) NOT NULL,
    shipping_address_id uuid,
    billing_address_id uuid,
    source_at_purchase character varying(100),
    medium_at_purchase character varying(100),
    campaign_at_purchase character varying(255),
    referrer_url_at_purchase text,
    ip_address_at_purchase inet,
    user_agent_at_purchase text,
    extra_attributes jsonb,
    start_date timestamp with time zone,
    end_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.payments (
    id integer DEFAULT nextval('payments_id_seq'::regclass) NOT NULL,
    reservation_id uuid,
    payment_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    amount numeric(10,2) NOT NULL,
    currency character varying(10) DEFAULT 'USD'::character varying,
    payment_method character varying(50),
    status character varying(50) DEFAULT 'pending'::character varying,
    payment_gateway_transaction_id character varying(50),
    amount_in_cents bigint,
    payment_method_type character varying(20),
    payment_method_data jsonb,
    customer_email character varying(255),
    customer_data jsonb,
    billing_data jsonb,
    finalized_at timestamp with time zone,
    status_message text,
    reference character varying(255),
    environment character varying(10),
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    order_id uuid
);

CREATE TABLE public.product (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    drop_id uuid,
    category_id uuid,
    name character varying(100) NOT NULL,
    description text,
    price numeric(10,2) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    sequential_id bigint DEFAULT nextval('product_sequential_id_seq'::regclass) NOT NULL
);

CREATE TABLE public.product_drop (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(100) NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    creator_id uuid,
    status character varying(50) DEFAULT 'active'::character varying,
    sequential_id bigint DEFAULT nextval('product_drop_sequential_id_seq'::regclass) NOT NULL
);

CREATE TABLE public.product_images (
    product_id uuid NOT NULL,
    image_id uuid NOT NULL,
    order_number integer,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.product_variants (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    product_id uuid NOT NULL,
    sku character varying(255) NOT NULL,
    attributes jsonb,
    price_adjustment numeric(10,2) DEFAULT 0.00 NOT NULL,
    stock_quantity integer DEFAULT 0 NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.profile (
    name character varying,
    logo_avatar character varying,
    description character varying,
    website character varying,
    status boolean,
    city character varying,
    banner character varying,
    category character varying,
    shadowban boolean,
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    enterprise character varying(255),
    user_name character varying,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    planet character varying,
    country character varying,
    nationality_id integer NOT NULL,
    phone_number character varying(20) NOT NULL,
    updated_at timestamp with time zone DEFAULT now(),
    phone_country_code integer
);

CREATE TABLE public.profile_images (
    profile_id uuid NOT NULL,
    image_id uuid NOT NULL,
    image_type character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.promotions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    promotion_name character varying(255) NOT NULL,
    promotion_code character varying(50),
    description text,
    discount_type character varying(20) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    applies_to character varying(50) NOT NULL,
    target_cluster_id integer,
    target_area_id integer,
    target_product_id uuid,
    target_product_variant_id uuid,
    min_quantity integer DEFAULT 1,
    max_discount_amount numeric(10,2),
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.reservation_unit_qr_images (
    id bigint DEFAULT nextval('reservation_unit_qr_images_id_seq'::regclass) NOT NULL,
    reservation_unit_id integer NOT NULL,
    image_id uuid NOT NULL,
    type_image character varying(50) NOT NULL
);

CREATE TABLE public.reservation_units (
    id integer DEFAULT nextval('reservation_units_id_seq'::regclass) NOT NULL,
    reservation_id uuid NOT NULL,
    unit_id integer NOT NULL,
    status character varying(50) DEFAULT 'reserved'::character varying,
    original_user_id uuid NOT NULL,
    transfer_date timestamp with time zone,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    applied_sale_stage_id uuid,
    applied_promotion_id uuid
);

CREATE TABLE public.reservations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid,
    reservation_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    start_date timestamp with time zone NOT NULL,
    end_date timestamp with time zone NOT NULL,
    extra_attributes jsonb,
    status character varying(50) DEFAULT 'active'::character varying,
    updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE public.sale_stages (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    stage_name character varying(100) NOT NULL,
    description text,
    price_adjustment_type character varying(20) NOT NULL,
    price_adjustment_value numeric(10,2) NOT NULL,
    quantity_available integer NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    is_active boolean DEFAULT true NOT NULL,
    priority_order integer NOT NULL,
    target_area_id integer,
    target_product_variant_id uuid,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.sessions (
    id uuid NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    user_id uuid NOT NULL
);

CREATE TABLE public.template_versions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_id uuid NOT NULL,
    version_number integer NOT NULL,
    content text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE public.templates (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    template_name text NOT NULL,
    template_type text NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    subject_template text,
    sender_email character varying(255)
);

CREATE TABLE public.tenant_invitations (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    email text NOT NULL,
    token text NOT NULL,
    expires_at timestamp without time zone NOT NULL
);

CREATE TABLE public.tenant_members (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    user_id uuid NOT NULL,
    role text DEFAULT 'member'::text NOT NULL
);

CREATE TABLE public.tenant_modules (
    id uuid NOT NULL,
    tenant_id uuid NOT NULL,
    module_id uuid NOT NULL,
    is_active text DEFAULT 'true'::text,
    contracted_at timestamp without time zone DEFAULT now() NOT NULL,
    expires_at timestamp without time zone
);

CREATE TABLE public.tenants (
    id uuid NOT NULL,
    name text NOT NULL,
    slug text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);

CREATE TABLE public.tools (
    id uuid NOT NULL,
    name text NOT NULL,
    description text,
    slug text NOT NULL,
    is_active text DEFAULT 'true'::text,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now()
);

CREATE TABLE public.unit_transfer_log (
    id integer DEFAULT nextval('unit_transfer_log_id_seq'::regclass) NOT NULL,
    reservation_unit_id integer NOT NULL,
    from_user_id uuid NOT NULL,
    to_user_id uuid NOT NULL,
    transfer_date timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    transfer_reason character varying(255)
);

CREATE TABLE public.units (
    id integer DEFAULT nextval('units_id_seq'::regclass) NOT NULL,
    area_id integer NOT NULL,
    status character varying(50) DEFAULT 'available'::character varying,
    extra_attributes jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    nomenclature_letter_area character varying(2),
    nomenclature_number_area integer,
    nomenclature_number_unit integer,
    updated_at timestamp with time zone DEFAULT now()
);

-- Indexes
CREATE INDEX idx_addresses_user_id ON public.addresses USING btree (user_id);
CREATE INDEX idx_addresses_address_type ON public.addresses USING btree (address_type);
CREATE INDEX idx_inventory_transactions_variant_id ON public.inventory_transactions USING btree (variant_id);
CREATE INDEX idx_inventory_transactions_transaction_date ON public.inventory_transactions USING btree (transaction_date);
CREATE INDEX idx_order_items_variant_id ON public.order_items USING btree (variant_id);
CREATE INDEX idx_order_items_order_id ON public.order_items USING btree (order_id);
CREATE INDEX idx_order_status_history_change_date ON public.order_status_history USING btree (change_date);
CREATE INDEX idx_order_status_history_order_id ON public.order_status_history USING btree (order_id);
CREATE INDEX idx_orders_user_id ON public.orders USING btree (user_id);
CREATE INDEX idx_orders_status ON public.orders USING btree (status);
CREATE INDEX idx_orders_order_date ON public.orders USING btree (order_date);
CREATE INDEX idx_payments_gateway_transaction_id ON public.payments USING btree (payment_gateway_transaction_id);
CREATE INDEX idx_payments_order_id ON public.payments USING btree (order_id);
CREATE INDEX idx_product_variants_sku ON public.product_variants USING btree (sku);
CREATE INDEX idx_product_variants_product_id ON public.product_variants USING btree (product_id);
CREATE INDEX idx_promotions_target_product ON public.promotions USING btree (target_product_id);
CREATE INDEX idx_promotions_target_product_variant ON public.promotions USING btree (target_product_variant_id);
CREATE INDEX idx_promotions_target_cluster ON public.promotions USING btree (target_cluster_id);
CREATE INDEX idx_promotions_target_area ON public.promotions USING btree (target_area_id);
CREATE INDEX idx_promotions_applies_to ON public.promotions USING btree (applies_to);
CREATE INDEX idx_reservation_unit_qr_images_reservation_unit_id ON public.reservation_unit_qr_images USING btree (reservation_unit_id);
CREATE INDEX idx_reservation_unit_qr_images_image_id ON public.reservation_unit_qr_images USING btree (image_id);
CREATE INDEX idx_reservation_unit_qr_images_type_image ON public.reservation_unit_qr_images USING btree (type_image);
CREATE INDEX idx_sale_stages_target_area ON public.sale_stages USING btree (target_area_id);
CREATE INDEX idx_sale_stages_target_product_variant ON public.sale_stages USING btree (target_product_variant_id);


-- Constraints (Primary Keys, Unique, Foreign Keys, Check)
ALTER TABLE drizzle.__drizzle_migrations
    ADD CONSTRAINT __drizzle_migrations_pkey PRIMARY KEY (id);
ALTER TABLE public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);
ALTER TABLE public.addresses
    ADD CONSTRAINT addresses_pkey PRIMARY KEY (id);
ALTER TABLE public.addresses
    ADD CONSTRAINT addresses_user_id_fkey FOREIGN KEY (user_id) REFERENCES profile(id);
ALTER TABLE public.areas
    ADD CONSTRAINT areas_pkey PRIMARY KEY (id);
ALTER TABLE public.areas
    ADD CONSTRAINT fk_cluster FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE CASCADE;
ALTER TABLE public.articles
    ADD CONSTRAINT articles_description_seo_key UNIQUE (meta_descripcion);
ALTER TABLE public.articles
    ADD CONSTRAINT articles_id_profile_fkey FOREIGN KEY (id_profile) REFERENCES profile(id) ON UPDATE RESTRICT ON DELETE RESTRICT;
ALTER TABLE public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);
ALTER TABLE public.articles
    ADD CONSTRAINT articles_slug_key UNIQUE (slug);
ALTER TABLE public.campaign
    ADD CONSTRAINT campaign_pkey PRIMARY KEY (id);
ALTER TABLE public.campaign
    ADD CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE RESTRICT;
ALTER TABLE public.campaign_leads
    ADD CONSTRAINT campaign_leads_pkey PRIMARY KEY (id);
ALTER TABLE public.campaign_leads
    ADD CONSTRAINT fk_campaign FOREIGN KEY (campaign_id) REFERENCES campaign(id) ON DELETE RESTRICT;
ALTER TABLE public.campaign_leads
    ADD CONSTRAINT fk_lead FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE RESTRICT;
ALTER TABLE public.campaign_leads
    ADD CONSTRAINT uq_campaign_lead UNIQUE (campaign_id, lead_id);
ALTER TABLE public.campaign_template_versions
    ADD CONSTRAINT campaign_template_versions_campaign_id_fkey FOREIGN KEY (campaign_id) REFERENCES campaign(id) ON DELETE CASCADE;
ALTER TABLE public.campaign_template_versions
    ADD CONSTRAINT campaign_template_versions_pkey PRIMARY KEY (campaign_id, template_version_id);
ALTER TABLE public.campaign_template_versions
    ADD CONSTRAINT campaign_template_versions_template_version_id_fkey FOREIGN KEY (template_version_id) REFERENCES template_versions(id) ON DELETE CASCADE;
ALTER TABLE public.cancellations
    ADD CONSTRAINT cancellations_pkey PRIMARY KEY (id);
ALTER TABLE public.cancellations
    ADD CONSTRAINT fk_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE;
ALTER TABLE public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
ALTER TABLE public.cluster_images
    ADD CONSTRAINT cluster_images_pkey PRIMARY KEY (id);
ALTER TABLE public.cluster_images
    ADD CONSTRAINT fk_cluster FOREIGN KEY (cluster_id) REFERENCES clusters(id) ON DELETE CASCADE;
ALTER TABLE public.cluster_images
    ADD CONSTRAINT fk_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE;
ALTER TABLE public.clusters
    ADD CONSTRAINT clusters_pkey PRIMARY KEY (id);
ALTER TABLE public.clusters
    ADD CONSTRAINT fk_legal_info FOREIGN KEY (legal_info_id) REFERENCES legal_info(id) ON DELETE RESTRICT;
ALTER TABLE public.clusters
    ADD CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE public.commentable_items
    ADD CONSTRAINT commentable_items_pkey PRIMARY KEY (id);
ALTER TABLE public.commentable_items
    ADD CONSTRAINT fk_comment FOREIGN KEY (comment_id) REFERENCES comments(id) ON DELETE RESTRICT;
ALTER TABLE public.comments
    ADD CONSTRAINT check_timestamps CHECK (((updated_at IS NULL) OR (updated_at > created_at)));
ALTER TABLE public.comments
    ADD CONSTRAINT comments_comment_check CHECK ((length(TRIM(BOTH FROM comment)) > 0));
ALTER TABLE public.comments
    ADD CONSTRAINT comments_emotion_emoji_check CHECK ((emotion_emoji ~ '^[\x{1F300}-\x{1F6FF}]$'::text));
ALTER TABLE public.comments
    ADD CONSTRAINT comments_pkey PRIMARY KEY (id);
ALTER TABLE public.comments
    ADD CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE RESTRICT;
ALTER TABLE public.email_clicks
    ADD CONSTRAINT email_clicks_pkey PRIMARY KEY (id);
ALTER TABLE public.email_clicks
    ADD CONSTRAINT fk_email_clicks_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id) ON DELETE CASCADE;
ALTER TABLE public.email_clicks
    ADD CONSTRAINT fk_email_clicks_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
ALTER TABLE public.email_opens
    ADD CONSTRAINT email_opens_pkey PRIMARY KEY (id);
ALTER TABLE public.email_opens
    ADD CONSTRAINT fk_email_opens_campaign_id FOREIGN KEY (campaign_id) REFERENCES campaign(id) ON DELETE CASCADE;
ALTER TABLE public.email_opens
    ADD CONSTRAINT fk_email_opens_lead_id FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE;
ALTER TABLE public.images
    ADD CONSTRAINT images_pkey PRIMARY KEY (id);
ALTER TABLE public.images
    ADD CONSTRAINT unique_path UNIQUE (path);
ALTER TABLE public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_created_by_fkey FOREIGN KEY (created_by) REFERENCES profile(id);
ALTER TABLE public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_pkey PRIMARY KEY (id);
ALTER TABLE public.inventory_transactions
    ADD CONSTRAINT inventory_transactions_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES product_variants(id);
ALTER TABLE public.leads
    ADD CONSTRAINT fk_profile FOREIGN KEY (profile_id) REFERENCES profile(id) ON DELETE RESTRICT;
ALTER TABLE public.leads
    ADD CONSTRAINT leads_pkey PRIMARY KEY (id);
ALTER TABLE public.legal_info
    ADD CONSTRAINT legal_info_pkey PRIMARY KEY (id);
ALTER TABLE public.magic_tokens
    ADD CONSTRAINT magic_tokens_pkey PRIMARY KEY (id);
ALTER TABLE public.magic_tokens
    ADD CONSTRAINT magic_tokens_token_unique UNIQUE (token);
ALTER TABLE public.magic_tokens
    ADD CONSTRAINT magic_tokens_user_id_profile_id_fk FOREIGN KEY (user_id) REFERENCES profile(id);
ALTER TABLE public.module_tools
    ADD CONSTRAINT module_tools_pkey PRIMARY KEY (id);
ALTER TABLE public.modules
    ADD CONSTRAINT modules_pkey PRIMARY KEY (id);
ALTER TABLE public.modules
    ADD CONSTRAINT modules_slug_unique UNIQUE (slug);
ALTER TABLE public.order_items
    ADD CONSTRAINT fk_order_item_promotion FOREIGN KEY (applied_promotion_id) REFERENCES promotions(id) ON DELETE SET NULL;
ALTER TABLE public.order_items
    ADD CONSTRAINT fk_order_item_sale_stage FOREIGN KEY (applied_sale_stage_id) REFERENCES sale_stages(id) ON DELETE SET NULL;
ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_order_id_variant_id_key UNIQUE (order_id, variant_id);
ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
ALTER TABLE public.order_items
    ADD CONSTRAINT order_items_variant_id_fkey FOREIGN KEY (variant_id) REFERENCES product_variants(id);
ALTER TABLE public.order_status_history
    ADD CONSTRAINT order_status_history_changed_by_fkey FOREIGN KEY (changed_by) REFERENCES profile(id);
ALTER TABLE public.order_status_history
    ADD CONSTRAINT order_status_history_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE public.order_status_history
    ADD CONSTRAINT order_status_history_pkey PRIMARY KEY (id);
ALTER TABLE public.orders
    ADD CONSTRAINT orders_billing_address_id_fkey FOREIGN KEY (billing_address_id) REFERENCES addresses(id);
ALTER TABLE public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
ALTER TABLE public.orders
    ADD CONSTRAINT orders_shipping_address_id_fkey FOREIGN KEY (shipping_address_id) REFERENCES addresses(id);
ALTER TABLE public.orders
    ADD CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES profile(id);
ALTER TABLE public.payments
    ADD CONSTRAINT chk_payment_entity CHECK ((((order_id IS NOT NULL) AND (reservation_id IS NULL)) OR ((order_id IS NULL) AND (reservation_id IS NOT NULL))));
ALTER TABLE public.payments
    ADD CONSTRAINT fk_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE;
ALTER TABLE public.payments
    ADD CONSTRAINT payments_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id);
ALTER TABLE public.payments
    ADD CONSTRAINT payments_pkey PRIMARY KEY (id);
ALTER TABLE public.product
    ADD CONSTRAINT product_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id);
ALTER TABLE public.product
    ADD CONSTRAINT product_drop_id_fkey FOREIGN KEY (drop_id) REFERENCES product_drop(id);
ALTER TABLE public.product
    ADD CONSTRAINT product_pkey PRIMARY KEY (id);
ALTER TABLE public.product_drop
    ADD CONSTRAINT fk_product_drop_profile FOREIGN KEY (creator_id) REFERENCES profile(id);
ALTER TABLE public.product_drop
    ADD CONSTRAINT product_drop_pkey PRIMARY KEY (id);
ALTER TABLE public.product_images
    ADD CONSTRAINT product_images_image_id_fkey FOREIGN KEY (image_id) REFERENCES images(id);
ALTER TABLE public.product_images
    ADD CONSTRAINT product_images_pkey PRIMARY KEY (product_id, image_id);
ALTER TABLE public.product_images
    ADD CONSTRAINT product_images_product_id_fkey FOREIGN KEY (product_id) REFERENCES product(id);
ALTER TABLE public.product_variants
    ADD CONSTRAINT product_variants_pkey PRIMARY KEY (id);
ALTER TABLE public.product_variants
    ADD CONSTRAINT product_variants_product_id_fkey FOREIGN KEY (product_id) REFERENCES product(id);
ALTER TABLE public.product_variants
    ADD CONSTRAINT product_variants_sku_key UNIQUE (sku);
ALTER TABLE public.profile
    ADD CONSTRAINT profile_email_key UNIQUE (email);
ALTER TABLE public.profile
    ADD CONSTRAINT profile_pkey PRIMARY KEY (id);
ALTER TABLE public.profile_images
    ADD CONSTRAINT profile_images_image_id_fkey FOREIGN KEY (image_id) REFERENCES images(id);
ALTER TABLE public.profile_images
    ADD CONSTRAINT profile_images_pkey PRIMARY KEY (profile_id, image_id, image_type);
ALTER TABLE public.profile_images
    ADD CONSTRAINT profile_images_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES profile(id);
ALTER TABLE public.promotions
    ADD CONSTRAINT chk_promotion_target_type_match CHECK (((((applies_to)::text = 'all_items'::text) AND (target_cluster_id IS NULL) AND (target_area_id IS NULL) AND (target_product_id IS NULL) AND (target_product_variant_id IS NULL)) OR (((applies_to)::text = 'cluster'::text) AND (target_cluster_id IS NOT NULL) AND (target_area_id IS NULL) AND (target_product_id IS NULL) AND (target_product_variant_id IS NULL)) OR (((applies_to)::text = 'area'::text) AND (target_area_id IS NOT NULL) AND (target_cluster_id IS NULL) AND (target_product_id IS NULL) AND (target_product_variant_id IS NULL)) OR (((applies_to)::text = 'product'::text) AND (target_product_id IS NOT NULL) AND (target_cluster_id IS NULL) AND (target_area_id IS NULL) AND (target_product_variant_id IS NULL)) OR (((applies_to)::text = 'product_variant'::text) AND (target_product_variant_id IS NOT NULL) AND (target_cluster_id IS NULL) AND (target_area_id IS NULL) AND (target_product_id IS NULL))));
ALTER TABLE public.promotions
    ADD CONSTRAINT fk_promotion_target_area FOREIGN KEY (target_area_id) REFERENCES areas(id) ON DELETE RESTRICT;
ALTER TABLE public.promotions
    ADD CONSTRAINT fk_promotion_target_cluster FOREIGN KEY (target_cluster_id) REFERENCES clusters(id) ON DELETE RESTRICT;
ALTER TABLE public.promotions
    ADD CONSTRAINT fk_promotion_target_product FOREIGN KEY (target_product_id) REFERENCES product(id) ON DELETE RESTRICT;
ALTER TABLE public.promotions
    ADD CONSTRAINT fk_promotion_target_product_variant FOREIGN KEY (target_product_variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT;
ALTER TABLE public.promotions
    ADD CONSTRAINT promotions_pkey PRIMARY KEY (id);
ALTER TABLE public.promotions
    ADD CONSTRAINT promotions_promotion_code_key UNIQUE (promotion_code);
ALTER TABLE public.reservation_unit_qr_images
    ADD CONSTRAINT fk_image FOREIGN KEY (image_id) REFERENCES images(id) ON DELETE CASCADE;
ALTER TABLE public.reservation_unit_qr_images
    ADD CONSTRAINT fk_reservation_unit FOREIGN KEY (reservation_unit_id) REFERENCES reservation_units(id) ON DELETE CASCADE;
ALTER TABLE public.reservation_unit_qr_images
    ADD CONSTRAINT reservation_unit_qr_images_pkey PRIMARY KEY (id);
ALTER TABLE public.reservation_units
    ADD CONSTRAINT fk_original_user FOREIGN KEY (original_user_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE public.reservation_units
    ADD CONSTRAINT fk_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE;
ALTER TABLE public.reservation_units
    ADD CONSTRAINT fk_reservation_unit_promotion FOREIGN KEY (applied_promotion_id) REFERENCES promotions(id) ON DELETE SET NULL;
ALTER TABLE public.reservation_units
    ADD CONSTRAINT fk_reservation_unit_sale_stage FOREIGN KEY (applied_sale_stage_id) REFERENCES sale_stages(id) ON DELETE SET NULL;
ALTER TABLE public.reservation_units
    ADD CONSTRAINT fk_unit FOREIGN KEY (unit_id) REFERENCES units(id) ON DELETE CASCADE;
ALTER TABLE public.reservation_units
    ADD CONSTRAINT reservation_units_pkey PRIMARY KEY (id);
ALTER TABLE public.reservations
    ADD CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE public.reservations
    ADD CONSTRAINT reservations_pkey PRIMARY KEY (id);
ALTER TABLE public.sale_stages
    ADD CONSTRAINT chk_sale_stage_target_one_type CHECK ((((target_area_id IS NOT NULL) AND (target_product_variant_id IS NULL)) OR ((target_area_id IS NULL) AND (target_product_variant_id IS NOT NULL))));
ALTER TABLE public.sale_stages
    ADD CONSTRAINT fk_sale_stage_target_area FOREIGN KEY (target_area_id) REFERENCES areas(id) ON DELETE RESTRICT;
ALTER TABLE public.sale_stages
    ADD CONSTRAINT fk_sale_stage_target_product_variant FOREIGN KEY (target_product_variant_id) REFERENCES product_variants(id) ON DELETE RESTRICT;
ALTER TABLE public.sale_stages
    ADD CONSTRAINT sale_stages_pkey PRIMARY KEY (id);
ALTER TABLE public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);
ALTER TABLE public.sessions
    ADD CONSTRAINT sessions_user_id_profile_id_fk FOREIGN KEY (user_id) REFERENCES profile(id);
ALTER TABLE public.sessions
    ADD CONSTRAINT sessions_user_id_profiles_id_fk FOREIGN KEY (user_id) REFERENCES profile(id);
ALTER TABLE public.template_versions
    ADD CONSTRAINT fk_template_id FOREIGN KEY (template_id) REFERENCES templates(id);
ALTER TABLE public.template_versions
    ADD CONSTRAINT template_versions_pkey PRIMARY KEY (id);
ALTER TABLE public.template_versions
    ADD CONSTRAINT uq_template_version UNIQUE (template_id, version_number);
ALTER TABLE public.templates
    ADD CONSTRAINT templates_pkey PRIMARY KEY (id);
ALTER TABLE public.templates
    ADD CONSTRAINT templates_template_name_key UNIQUE (template_name);
ALTER TABLE public.tenant_invitations
    ADD CONSTRAINT tenant_invitations_pkey PRIMARY KEY (id);
ALTER TABLE public.tenant_invitations
    ADD CONSTRAINT tenant_invitations_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.tenant_invitations
    ADD CONSTRAINT tenant_invitations_token_unique UNIQUE (token);
ALTER TABLE public.tenant_members
    ADD CONSTRAINT tenant_members_pkey PRIMARY KEY (id);
ALTER TABLE public.tenant_members
    ADD CONSTRAINT tenant_members_tenant_id_tenants_id_fk FOREIGN KEY (tenant_id) REFERENCES tenants(id);
ALTER TABLE public.tenant_members
    ADD CONSTRAINT tenant_members_user_id_profile_id_fk FOREIGN KEY (user_id) REFERENCES profile(id);
ALTER TABLE public.tenant_modules
    ADD CONSTRAINT tenant_modules_pkey PRIMARY KEY (id);
ALTER TABLE public.tenants
    ADD CONSTRAINT tenants_pkey PRIMARY KEY (id);
ALTER TABLE public.tools
    ADD CONSTRAINT tools_pkey PRIMARY KEY (id);
ALTER TABLE public.tools
    ADD CONSTRAINT tools_slug_unique UNIQUE (slug);
ALTER TABLE public.unit_transfer_log
    ADD CONSTRAINT fk_from_user FOREIGN KEY (from_user_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE public.unit_transfer_log
    ADD CONSTRAINT fk_reservation_unit FOREIGN KEY (reservation_unit_id) REFERENCES reservation_units(id) ON DELETE CASCADE;
ALTER TABLE public.unit_transfer_log
    ADD CONSTRAINT fk_to_user FOREIGN KEY (to_user_id) REFERENCES profile(id) ON DELETE CASCADE;
ALTER TABLE public.unit_transfer_log
    ADD CONSTRAINT unit_transfer_log_pkey PRIMARY KEY (id);
ALTER TABLE public.units
    ADD CONSTRAINT fk_area FOREIGN KEY (area_id) REFERENCES areas(id) ON DELETE CASCADE;
ALTER TABLE public.units
    ADD CONSTRAINT units_pkey PRIMARY KEY (id);


-- Row-Level Security Policies


-- Functions and Procedures
CREATE OR REPLACE FUNCTION public.add_reservation_and_profile(p_name character varying, p_email character varying, p_phone_number character varying, p_nationality_id integer, p_card_information jsonb)
 RETURNS TABLE(reservation_id uuid, is_new_user boolean)
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_user_id uuid;
    card_item jsonb;
    available_unit_id integer;
    out_reservation_id uuid;
    out_is_new_user boolean;
    unit_id_element integer;
BEGIN
    -- Check if user exists
    SELECT id INTO new_user_id
    FROM public.profile
    WHERE email = p_email;

    -- Create new user if doesn't exist
    IF new_user_id IS NULL THEN
        out_is_new_user := true;
        INSERT INTO public.profile (
            name,
            email,
            phone_number,
            nationality_id
        ) VALUES (
            p_name,
            p_email,
            p_phone_number,
            p_nationality_id
        )
        RETURNING id INTO new_user_id;
    ELSE
        out_is_new_user := false;
    END IF;

    -- Create reservation
    INSERT INTO public.reservations (
        user_id, 
        start_date, 
        end_date, 
        reservation_date
    ) VALUES (
        new_user_id, 
        NOW(), 
        NOW() + INTERVAL '7 days',
        NOW()
    )
    RETURNING id INTO out_reservation_id;

    -- Process each item in the card information
    FOR card_item IN SELECT * FROM jsonb_array_elements(p_card_information)
    LOOP
        IF (card_item->>'assigned')::boolean IS TRUE THEN
            -- Handle palcos with predefined unit_ids
            FOR unit_id_element IN SELECT jsonb_array_elements_text((card_item->'unit_id'))::integer
            LOOP
                INSERT INTO public.reservation_units (
                    reservation_id,
                    unit_id,
                    original_user_id,
                    status
                ) VALUES (
                    out_reservation_id,
                    unit_id_element,
                    new_user_id,
                    'reserved'
                );
            END LOOP;
        ELSE
            -- Handle regular units with automatic assignment
            SELECT id INTO available_unit_id
            FROM public.units
            WHERE area_id = (card_item->>'area_id')::integer
            AND id NOT IN (SELECT unit_id FROM public.reservation_units WHERE status = 'reserved')
            LIMIT 1;

            IF available_unit_id IS NOT NULL THEN
                INSERT INTO public.reservation_units (
                    reservation_id,
                    unit_id,
                    original_user_id,
                    status
                ) VALUES (
                    out_reservation_id,
                    available_unit_id,
                    new_user_id,
                    'reserved'
                );
            END IF;
        END IF;
    END LOOP;

    RETURN QUERY SELECT out_reservation_id, out_is_new_user;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.add_reservation_and_profile(p_name character varying, p_email character varying, p_phone_number character varying, p_nationality_id integer, p_card_information jsonb, extra_atribute_reservation_unit character varying)
 RETURNS TABLE(reservation_id uuid, is_new_user boolean)
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_user_id uuid;
    card_item jsonb;
    available_unit_id integer;
    out_reservation_id uuid;
    out_is_new_user boolean;
    unit_id_element integer;
BEGIN
    -- Check if user exists
    SELECT id INTO new_user_id
    FROM public.profile
    WHERE email = p_email;

    -- Create new user if doesn't exist
    IF new_user_id IS NULL THEN
        out_is_new_user := true;
        INSERT INTO public.profile (
            name,
            email,
            phone_number,
            nationality_id
        ) VALUES (
            p_name,
            p_email,
            p_phone_number,
            p_nationality_id
        )
        RETURNING id INTO new_user_id;
    ELSE
        out_is_new_user := false;
    END IF;

    -- Create reservation with extra attribute as STRING
    INSERT INTO public.reservations (
        user_id, 
        start_date, 
        end_date, 
        reservation_date,
        extra_attributes
    ) VALUES (
        new_user_id, 
        NOW(), 
        NOW() + INTERVAL '7 days',
        NOW(),
        jsonb_build_object('promotor', extra_atribute_reservation_unit)  -- Almacena como string
    )
    RETURNING id INTO out_reservation_id;

    -- Process each item in the card information
    FOR card_item IN SELECT * FROM jsonb_array_elements(p_card_information)
    LOOP
        IF (card_item->>'assigned')::boolean IS TRUE THEN
            -- Handle palcos with predefined unit_ids
            FOR unit_id_element IN SELECT jsonb_array_elements_text((card_item->'unit_id'))::integer
            LOOP
                INSERT INTO public.reservation_units (
                    reservation_id,
                    unit_id,
                    original_user_id,
                    status
                ) VALUES (
                    out_reservation_id,
                    unit_id_element,
                    new_user_id,
                    'reserved'
                );
            END LOOP;
        ELSE
            -- Handle regular units with automatic assignment
            SELECT id INTO available_unit_id
            FROM public.units
            WHERE area_id = (card_item->>'area_id')::integer
            AND id NOT IN (SELECT unit_id FROM public.reservation_units WHERE status = 'reserved')
            LIMIT 1;

            IF available_unit_id IS NOT NULL THEN
                INSERT INTO public.reservation_units (
                    reservation_id,
                    unit_id,
                    original_user_id,
                    status
                ) VALUES (
                    out_reservation_id,
                    available_unit_id,
                    new_user_id,
                    'reserved'
                );
            END IF;
        END IF;
    END LOOP;

    RETURN QUERY SELECT out_reservation_id, out_is_new_user;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.add_reservation_and_profile_gift(p_name character varying, p_email character varying, p_phone_number character varying, p_nationality_id integer, p_area_id integer)
 RETURNS TABLE(reservation_id uuid, is_new_user boolean)
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_user_id uuid;
    available_unit_id integer;
    out_reservation_id uuid;
    out_is_new_user boolean;
    has_general_ticket boolean;
BEGIN
    -- Check if user exists
    SELECT id INTO new_user_id
    FROM public.profile
    WHERE email = p_email;

    -- Create new user if doesn't exist
    IF new_user_id IS NULL THEN
        out_is_new_user := true;
        INSERT INTO public.profile (
            name,
            email,
            phone_number,
            nationality_id
        ) VALUES (
            p_name,
            p_email,
            p_phone_number,
            p_nationality_id
        )
        RETURNING id INTO new_user_id;
    ELSE
        out_is_new_user := false;
    END IF;

    -- Check if user already has a general ticket assigned
    SELECT EXISTS (
        SELECT 1 FROM public.reservation_units ru
        JOIN public.units u ON ru.unit_id = u.id
        WHERE ru.original_user_id = new_user_id
        AND u.area_id = p_area_id
    ) INTO has_general_ticket;

    -- If the user already has a ticket, do not create a new reservation
    IF has_general_ticket THEN
        RAISE EXCEPTION 'User already has a general ticket assigned';
    END IF;

    -- Create reservation
    INSERT INTO public.reservations (
        user_id, 
        start_date, 
        end_date, 
        reservation_date
    ) VALUES (
        new_user_id, 
        NOW(), 
        NOW() + INTERVAL '7 days',
        NOW()
    )
    RETURNING id INTO out_reservation_id;

    -- Assign a unit from the specified area
    SELECT id INTO available_unit_id
    FROM public.units
    WHERE area_id = p_area_id
    AND id NOT IN (
        SELECT unit_id FROM public.reservation_units 
        WHERE status IN ('reserved', 'approved')
    )
    LIMIT 1;

    IF available_unit_id IS NOT NULL THEN
        INSERT INTO public.reservation_units (
            reservation_id,
            unit_id,
            original_user_id,
            status
        ) VALUES (
            out_reservation_id,
            available_unit_id,
            new_user_id,
            'approved'
        );
    ELSE
        RAISE EXCEPTION 'No available units in the specified area';
    END IF;

    RETURN QUERY SELECT out_reservation_id, out_is_new_user;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.add_reservation_big_area_gift(p_name character varying, p_email character varying, p_phone_number character varying, p_nationality_id integer, id_area integer, unit_id integer)
 RETURNS TABLE(reservation_id uuid, is_new_user boolean, area_price numeric, area_service double precision)
 LANGUAGE plpgsql
AS $function$
DECLARE
    new_user_id uuid;
    out_reservation_id uuid;
    out_is_new_user boolean;
    assigned_unit RECORD;
    area_price numeric(10,2);
    area_service float8;
BEGIN
    -- Obtener el precio y el servicio del área
    SELECT price, service 
    INTO area_price, area_service
    FROM public.areas
    WHERE id = id_area;

    -- Verificar si el usuario ya existe
    SELECT id INTO new_user_id
    FROM public.profile
    WHERE email = p_email;

    -- Crear nuevo usuario si no existe
    IF new_user_id IS NULL THEN
        out_is_new_user := true;
        INSERT INTO public.profile (
            name, email, phone_number, nationality_id
        ) VALUES (
            p_name, p_email, p_phone_number, p_nationality_id
        )
        RETURNING id INTO new_user_id;
    ELSE
        out_is_new_user := false;
    END IF;

    -- Crear reservación
    INSERT INTO public.reservations (
        user_id, start_date, end_date, reservation_date, extra_attributes
    ) VALUES (
        new_user_id, NOW(), NOW() + INTERVAL '7 days', NOW(),
        jsonb_build_object('promotor', 'extra_atribute_reservation_unit')
    )
    RETURNING id INTO out_reservation_id;

    -- Asignar unidades basadas en los criterios dados
    FOR assigned_unit IN
        SELECT u.id AS unit_id
        FROM public.units u
        JOIN public.areas a ON u.area_id = a.id
        JOIN public.clusters c ON a.cluster_id = c.id
        JOIN public.profile p ON c.profile_id = p.id
        WHERE a.unit_capacity > 1
        AND c.shadowban = false
        AND c.is_active = true
        AND c.slug_cluster = 'festival-de-las-madres'
        AND c.id = 23
        AND p.enterprise = 'Eventos Central Park'
        AND p.status = true
        AND p.shadowban = false
        AND a.id = id_area
        AND u.nomenclature_number_area = unit_id
    LOOP
        -- Insertar cada unidad asignada en reservation_units
        INSERT INTO public.reservation_units (
            reservation_id, unit_id, original_user_id, status
        ) VALUES (
            out_reservation_id, assigned_unit.unit_id, new_user_id, 'reserved'
        );
    END LOOP;

    -- Retornar los valores incluyendo el precio y servicio del área
    RETURN QUERY SELECT out_reservation_id, out_is_new_user, area_price, area_service;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_campaign_with_templates(p_profile_id uuid, p_campaign_name character varying, p_campaign_slug character varying, p_email_template_name text, p_landing_template_name text, p_subject_template text, p_sender_email character varying, p_email_content text, p_landing_content text)
 RETURNS TABLE(campaign_id uuid, status_message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_campaign_id uuid;
    v_status_message text;
    v_email_template_id uuid;
    v_landing_template_id uuid;
    v_email_template_version_id uuid;
    v_landing_template_version_id uuid;
BEGIN
    -- 1. Crear o recuperar la campaña
    SELECT T.campaign_id, T.status_message
    INTO v_campaign_id, v_status_message
    FROM public.create_or_get_campaign(
        p_campaign_name,
        NOW(),
        NOW() + INTERVAL '1 month',
        'active',
        p_profile_id
    ) AS T;

    IF v_campaign_id IS NULL THEN
        status_message := 'Error al crear o recuperar la campaña.';
        RETURN NEXT;
        RETURN;
    END IF;
    
    -- 2. Actualizar el slug de la campaña
    UPDATE public.campaign SET slug = p_campaign_slug WHERE id = v_campaign_id;

    -- 3. Insertar plantilla de email, usando los nuevos parámetros
    INSERT INTO public.templates (template_name, template_type, description, subject_template, sender_email)
    VALUES
    (p_email_template_name, 'email', 'Plantilla de email para la campaña ' || p_campaign_name, p_subject_template, p_sender_email)
    RETURNING id INTO v_email_template_id;

    -- 4. Insertar versión de la plantilla de email usando el nuevo parámetro p_email_content
    INSERT INTO public.template_versions (template_id, version_number, content)
    VALUES
    (v_email_template_id, 1, p_email_content)
    RETURNING id INTO v_email_template_version_id;

    -- 5. Insertar plantilla de landing page
    INSERT INTO public.templates (template_name, template_type, description)
    VALUES
    (p_landing_template_name, 'landing', 'Plantilla de landing page para la campaña ' || p_campaign_name)
    RETURNING id INTO v_landing_template_id;

    -- 6. Insertar versión de la plantilla de landing page usando el nuevo parámetro p_landing_content
    INSERT INTO public.template_versions (template_id, version_number, content)
    VALUES
    (v_landing_template_id, 1, p_landing_content)
    RETURNING id INTO v_landing_template_version_id;

    -- 7. Asociar las versiones de las plantillas con la campaña
    INSERT INTO public.campaign_template_versions (campaign_id, template_version_id)
    VALUES
    (v_campaign_id, v_email_template_version_id),
    (v_campaign_id, v_landing_template_version_id);

    -- 8. Retornar los resultados
    RETURN QUERY SELECT v_campaign_id, 'Campaña y plantillas creadas y asociadas con éxito.';

END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_cluster_and_related_entities(p_profile_id uuid, p_cluster_data jsonb, p_areas_data jsonb, p_legal_info_data jsonb DEFAULT NULL::jsonb, p_images_data jsonb DEFAULT NULL::jsonb)
 RETURNS TABLE(created_cluster_id integer, status_message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_cluster_id_val integer; -- Variable interna para el ID del cluster creado
    v_legal_info_id_val integer;
    v_area_item jsonb;
    v_area_id_val integer;
    v_image_item jsonb;
    v_image_id_val uuid;
    v_units_capacity integer;
    v_nomenclature_letter_area character varying(2);
    v_nomenclature_number_area integer;

    -- Variables para capturar detalles del error para RAISE NOTICE
    _sql_state text;
    _message_text text;
    _pg_exception_detail text;
    _pg_exception_hint text;
BEGIN
    RAISE NOTICE 'DEBUG: Funcion create_cluster_and_related_entities iniciada.';
    RAISE NOTICE 'DEBUG: p_profile_id = %', p_profile_id;
    RAISE NOTICE 'DEBUG: p_cluster_data = %', p_cluster_data;
    RAISE NOTICE 'DEBUG: p_areas_data = %', p_areas_data;

    -- Asignar valores iniciales a las variables de salida para el camino de éxito por defecto
    -- Si el bloque interno falla, estas serán sobrescritas en el EXCEPTION
    created_cluster_id := NULL;
    status_message := 'Operacion no completada debido a error desconocido.';

    -- Bloque BEGIN/EXCEPTION interno para atrapar errores y asegurar que siempre se asignen los valores de retorno
    BEGIN
        -- 1. Insertar o asociar Información Legal (si se proporciona)
        IF p_legal_info_data IS NOT NULL THEN
            RAISE NOTICE 'DEBUG: Procesando legal_info_data.';
            INSERT INTO public.legal_info (
                nit, legal_name, address, city, country, puleb_code
            ) VALUES (
                p_legal_info_data->>'nit',
                p_legal_info_data->>'legal_name',
                p_legal_info_data->>'address',
                p_legal_info_data->>'city',
                p_legal_info_data->>'country',
                p_legal_info_data->>'puleb_code'
            )
            RETURNING id INTO v_legal_info_id_val;
            RAISE NOTICE 'DEBUG: legal_info_id insertado: %', v_legal_info_id_val;
        ELSE
            v_legal_info_id_val := NULL;
            RAISE NOTICE 'DEBUG: legal_info_data es NULL.';
        END IF;

        -- 2. Insertar el Cluster Principal
        RAISE NOTICE 'DEBUG: Insertando cluster principal.';
        INSERT INTO public.clusters (
            profile_id,
            cluster_name,
            description,
            start_date,
            end_date,
            cluster_type,
            slug_cluster,
            legal_info_id,
            is_active,
            shadowban,
            created_at
        ) VALUES (
            p_profile_id,
            p_cluster_data->>'name',
            p_cluster_data->>'description',
            (p_cluster_data->>'start_date')::timestamp with time zone,
            (p_cluster_data->>'end_date')::timestamp with time zone,
            p_cluster_data->>'cluster_type',
            p_cluster_data->>'slug_cluster',
            v_legal_info_id_val,
            TRUE,
            FALSE,
            NOW()
        )
        RETURNING id INTO v_cluster_id_val;
        RAISE NOTICE 'DEBUG: Cluster insertado con ID: %', v_cluster_id_val;

        -- 3. Insertar Áreas y sus Unidades
        RAISE NOTICE 'DEBUG: Procesando areas_data.';
        IF jsonb_typeof(p_areas_data) <> 'array' THEN
            RAISE EXCEPTION 'p_areas_data must be a JSON array.';
        END IF;

        FOR v_area_item IN SELECT * FROM jsonb_array_elements(p_areas_data)
        LOOP
            RAISE NOTICE 'DEBUG: Insertando area: % para cluster_id: %', v_area_item->>'area_name', v_cluster_id_val;
            INSERT INTO public.areas (
                cluster_id,
                area_name,
                description,
                capacity,
                price,
                currency,
                status,
                extra_attributes,
                nomenclature_letter,
                unit_capacity,
                service,
                created_at
            ) VALUES (
                v_cluster_id_val,
                v_area_item->>'area_name',
                v_area_item->>'description',
                (v_area_item->>'capacity')::integer,
                (v_area_item->>'price')::numeric(10,2),
                COALESCE(v_area_item->>'currency', 'USD'),
                COALESCE(v_area_item->>'status', 'available'),
                COALESCE(v_area_item->'extra_attributes', '{}'::jsonb),
                v_area_item->>'nomenclature_letter',
                (v_area_item->>'unit_capacity')::integer,
                (v_area_item->>'service')::double precision,
                NOW()
            )
            RETURNING id INTO v_area_id_val;
            RAISE NOTICE 'DEBUG: Area insertada con ID: %', v_area_id_val;

            v_units_capacity := (v_area_item->>'unit_capacity')::integer;
            v_nomenclature_letter_area := v_area_item->>'nomenclature_letter';
            v_nomenclature_number_area := (v_area_item->>'nomenclature_number_area')::integer;

            RAISE NOTICE 'DEBUG: Llamando create_units para area_id: % con % unidades', v_area_id_val, v_units_capacity;
            PERFORM public.create_units(
                v_area_id_val,
                v_units_capacity,
                COALESCE(v_area_item->'extra_attributes', '{}'::jsonb),
                v_nomenclature_letter_area,
                v_nomenclature_number_area
            );
            RAISE NOTICE 'DEBUG: create_units completado para area_id: %', v_area_id_val;
        END LOOP;

        -- 4. Insertar Imágenes y Asociaciones (si se proporcionan)
        IF p_images_data IS NOT NULL AND jsonb_typeof(p_images_data) = 'array' THEN
            RAISE NOTICE 'DEBUG: Procesando images_data.';
            FOR v_image_item IN SELECT * FROM jsonb_array_elements(p_images_data)
            LOOP
                RAISE NOTICE 'DEBUG: Insertando imagen: %', v_image_item->>'name';
                INSERT INTO public.images (
                    name, path, mime_type, size, description, created_at
                ) VALUES (
                    v_image_item->>'name',
                    v_image_item->>'path',
                    v_image_item->>'mime_type',
                    (v_image_item->>'size')::bigint,
                    v_image_item->>'description',
                    NOW()
                )
                RETURNING id INTO v_image_id_val;
                RAISE NOTICE 'DEBUG: Imagen insertada con ID: %', v_image_id_val;

                RAISE NOTICE 'DEBUG: Insertando cluster_image para cluster_id: % y image_id: %', v_cluster_id_val, v_image_id_val;
                INSERT INTO public.cluster_images (
                    cluster_id,
                    image_id,
                    type_image,
                    created_at
                ) VALUES (
                    v_cluster_id_val,
                    v_image_id_val,
                    v_image_item->>'type_image',
                    NOW()
                );
                RAISE NOTICE 'DEBUG: cluster_image insertada.';
            END LOOP;
        ELSE
            RAISE NOTICE 'DEBUG: images_data es NULL o no es un array.';
        END IF;

        -- Asignar valores de éxito
        created_cluster_id := v_cluster_id_val;
        status_message := 'Cluster and related entities created successfully.';
        RAISE NOTICE 'DEBUG: Funcion completada con exito. Retornando cluster_id: %', created_cluster_id;

    EXCEPTION
        WHEN OTHERS THEN
            -- Capturar detalles completos del error
            GET STACKED DIAGNOSTICS
                _message_text = MESSAGE_TEXT,
                _sql_state = RETURNED_SQLSTATE,
                _pg_exception_detail = PG_EXCEPTION_DETAIL,
                _pg_exception_hint = PG_EXCEPTION_HINT;

            -- Asignar valores de error a las variables de salida
            created_cluster_id := NULL;
            status_message := 'Error creando cluster: ' || COALESCE(_message_text, SQLERRM);
            RAISE NOTICE 'DEBUG: ERROR CAPTURADO (SQLSTATE=%): %', _sql_state, _message_text;
            IF _pg_exception_detail IS NOT NULL THEN
                RAISE NOTICE 'DEBUG: DETALLE: %', _pg_exception_detail;
            END IF;
            IF _pg_exception_hint IS NOT NULL THEN
                RAISE NOTICE 'DEBUG: SUGERENCIA: %', _pg_exception_hint;
            END IF;
    END; -- Fin del bloque BEGIN/EXCEPTION interno

    -- Este RETURN NEXT final siempre se ejecutará,
    -- ya sea con los valores de éxito o con los de error del EXCEPTION,
    -- garantizando que una fila se emita en la salida de la función.
    RETURN NEXT;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_or_get_campaign(p_campaign_name character varying, p_campaign_start_date timestamp with time zone, p_campaign_end_date timestamp with time zone, p_campaign_status character varying, p_campaign_profile_id uuid)
 RETURNS TABLE(campaign_id uuid, status_message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_campaign_id_internal UUID;
BEGIN
    -- Intenta encontrar una campaña existente
    SELECT id INTO v_campaign_id_internal
    FROM public.campaign
    WHERE name = p_campaign_name AND profile_id = p_campaign_profile_id;

    IF v_campaign_id_internal IS NULL THEN
        -- Si no existe, la crea
        INSERT INTO public.campaign (name, start_date, end_date, status, profile_id)
        VALUES (p_campaign_name, p_campaign_start_date, p_campaign_end_date, p_campaign_status, p_campaign_profile_id)
        RETURNING id INTO v_campaign_id_internal;
        RAISE NOTICE 'Campaña creada con ID: %', v_campaign_id_internal;

        -- Retorna el ID de la nueva campaña y el estado 'created'
        RETURN QUERY SELECT v_campaign_id_internal, 'created'::TEXT;
    ELSE
        RAISE NOTICE 'Campaña existente con ID: %', v_campaign_id_internal;

        -- Retorna el ID de la campaña existente y el estado 'existing'
        RETURN QUERY SELECT v_campaign_id_internal, 'existing'::TEXT;
    END IF;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.create_units(p_area_id integer, p_capacity_units integer, p_extra_attributes jsonb DEFAULT '{}'::jsonb, p_nomenclature_letter_area character varying DEFAULT 'A'::character varying, p_nomenclature_number_area integer DEFAULT 1)
 RETURNS void
 LANGUAGE plpgsql
AS $function$
DECLARE
    i INT; -- Iterador del bucle
BEGIN
    FOR i IN 1..p_capacity_units LOOP
        INSERT INTO public.units (
            area_id, 
            extra_attributes, 
            nomenclature_letter_area,  
            nomenclature_number_area,  
            nomenclature_number_unit,  
            status  
        ) 
        VALUES (
            p_area_id, 
            p_extra_attributes, 
            p_nomenclature_letter_area,    
            p_nomenclature_number_area,    
            i, -- Usar directamente el iterador del bucle
            'available'  
        );
    END LOOP;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.delete_profile(p_profile_id uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_profile_exists BOOLEAN;
    v_current_profile_status BOOLEAN;
    v_active_reservations_count INT;
    v_published_articles_count INT;
    v_active_campaigns_as_creator_count INT;
    v_pending_orders_count INT;
    v_unverified_leads_count INT;
    v_active_product_drops_count INT;
BEGIN
    RAISE NOTICE 'DEBUG: Starting delete_profile_final for profile ID: %', p_profile_id;

    -- ¡CORRECCIÓN EN LA LÍNEA 15! Obtener el estado del perfil y verificar su existencia de forma robusta
    SELECT status INTO v_current_profile_status FROM public.profile WHERE id = p_profile_id;
    v_profile_exists := FOUND; -- FOUND es una variable especial de PL/pgSQL que es TRUE si la SELECT anterior encontró una fila

    RAISE NOTICE 'DEBUG: Step 1 - Profile existence checked. Exists: %, Status: %', v_profile_exists, COALESCE(v_current_profile_status::text, 'NULL');

    IF NOT v_profile_exists THEN
        RAISE EXCEPTION 'Profile with ID % not found.', p_profile_id;
    END IF;

    -- If the profile is already inactive, no action needed.
    IF v_current_profile_status IS FALSE THEN
        RAISE NOTICE 'DEBUG: Profile already inactive.';
        RETURN 'Profile with ID ' || p_profile_id || ' is already inactive (soft deleted).';
    END IF;

    RAISE NOTICE 'DEBUG: Step 2 - Starting critical restrictions checks.';

    -- Check 2.1: Active Reservations
    SELECT COUNT(*)
    INTO v_active_reservations_count
    FROM public.reservations
    WHERE user_id = p_profile_id AND status IN ('reserved', 'approved');
    RAISE NOTICE 'DEBUG: Step 2.1 - Active reservations count: %', v_active_reservations_count;

    IF v_active_reservations_count > 0 THEN
        RAISE EXCEPTION 'Cannot deactivate profile with ID % because it has % active reservations (status: reserved or approved).', p_profile_id, v_active_reservations_count;
    END IF;

    -- Check 2.2: Active Campaigns created by this profile
    SELECT COUNT(*)
    INTO v_active_campaigns_as_creator_count
    FROM public.campaign
    WHERE profile_id = p_profile_id AND status = 'active';
    RAISE NOTICE 'DEBUG: Step 2.2 - Active campaigns count: %', v_active_campaigns_as_creator_count;

    IF v_active_campaigns_as_creator_count > 0 THEN
        RAISE EXCEPTION 'Cannot deactivate profile with ID % because it is associated with % active campaigns as creator.', p_profile_id, v_active_campaigns_as_creator_count;
    END IF;

    -- Check 2.3: Pending Orders
    SELECT COUNT(*)
    INTO v_pending_orders_count
    FROM public.orders
    WHERE user_id = p_profile_id AND status NOT IN ('completed', 'cancelled', 'refunded');
    RAISE NOTICE 'DEBUG: Step 2.3 - Pending orders count: %', v_pending_orders_count;

    IF v_pending_orders_count > 0 THEN
        RAISE EXCEPTION 'Cannot deactivate profile with ID % because it has % pending or unfulfilled orders.', p_profile_id, v_pending_orders_count;
    END IF;

    -- Check 2.4: Unverified Leads
    SELECT COUNT(*)
    INTO v_unverified_leads_count
    FROM public.leads
    WHERE profile_id = p_profile_id AND is_verified = FALSE;
    RAISE NOTICE 'DEBUG: Step 2.4 - Unverified leads count: %', v_unverified_leads_count;

    IF v_unverified_leads_count > 0 THEN
        RAISE EXCEPTION 'Cannot deactivate profile with ID % because it has % unverified leads.', p_profile_id, v_unverified_leads_count;
    END IF;

    -- Check 2.5: Active Product Drops Created by this Profile
    SELECT COUNT(*)
    INTO v_active_product_drops_count
    FROM public.product_drop
    WHERE creator_id = p_profile_id AND status = 'active';
    RAISE NOTICE 'DEBUG: Step 2.5 - Active product drops count: %', v_active_product_drops_count;

    IF v_active_product_drops_count > 0 THEN
        RAISE EXCEPTION 'Cannot deactivate profile with ID % because it is associated with % active product drops.', p_profile_id, v_active_product_drops_count;
    END IF;

    RAISE NOTICE 'DEBUG: All critical restrictions passed. Proceeding with soft delete.';

    -- 3. Perform the Soft Delete on the Profile
    UPDATE public.profile
    SET status = FALSE, updated_at = NOW()
    WHERE id = p_profile_id;
    RAISE NOTICE 'DEBUG: Step 3 - Profile status updated to FALSE.';

    -- 4. Cascading Soft Deletes for Related Entities
    UPDATE public.articles
    SET is_active = FALSE, published = FALSE, updated_at = NOW()
    WHERE author = p_profile_id AND is_active = TRUE;
    RAISE NOTICE 'DEBUG: Step 4.1 - Articles soft deleted.';

    UPDATE public.comments
    SET is_active = FALSE, shadowban = TRUE, updated_at = NOW()
    WHERE profile_id = p_profile_id AND is_active = TRUE;
    RAISE NOTICE 'DEBUG: Step 4.2 - Comments soft deleted.';

    RAISE NOTICE 'DEBUG: Function completed successfully.';
    RETURN 'Profile with ID ' || p_profile_id || ' has been successfully deactivated (soft deleted).';
END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_all_user_functions()
 RETURNS TABLE(fun_schema text, fun_name text, fun_return_type text, fun_language text, fun_definition text)
 LANGUAGE sql
AS $function$
    SELECT
        r.routine_schema::TEXT,
        r.routine_name::TEXT,
        r.data_type::TEXT,
        r.external_language::TEXT,
        pg_get_functiondef(p.oid)::TEXT
    FROM
        information_schema.routines r
    JOIN
        pg_proc p ON r.routine_name = p.proname
    JOIN
        pg_namespace n ON p.pronamespace = n.oid AND r.routine_schema = n.nspname
    WHERE
        r.routine_type = 'FUNCTION'
        AND r.routine_schema NOT IN ('pg_catalog', 'information_schema')
    ORDER BY
        r.routine_schema,
        r.routine_name;
$function$
;

CREATE OR REPLACE FUNCTION public.get_cluster_details(p_cluster_id integer)
 RETURNS TABLE(cluster_id integer, profile_id uuid, cluster_name character varying, description text, start_date timestamp with time zone, end_date timestamp with time zone, cluster_type character varying, slug_cluster text, is_active boolean, shadowban boolean, legal_info_id integer, profile_name character varying, legal_info_nit character varying, areas_data jsonb, images_data jsonb)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_sql text;
    v_found_id integer; -- Variable para verificar si el cluster existe y está activo/no shadowbanned
BEGIN
    -- Primero, verifica si el cluster con el ID dado existe y cumple con las condiciones de activo/no shadowban
    SELECT T1.id INTO v_found_id
    FROM public.clusters T1
    JOIN public.profile T2 ON T1.profile_id = T2.id
    WHERE T1.id = p_cluster_id
      AND T1.is_active = TRUE
      AND T1.shadowban = FALSE
      AND T2.status = TRUE
      AND T2.shadowban = FALSE;

    -- Si el cluster no se encuentra o no cumple las condiciones, no devuelve nada (o podrías RAISE EXCEPTION si lo prefieres)
    IF v_found_id IS NULL THEN
        -- Puedes lanzar una excepción aquí si el endpoint espera un 404 de la DB directamente.
         RAISE EXCEPTION 'Cluster con ID % no encontrado o no activo/visible.', p_cluster_id;
        RETURN; -- Retorna cero filas si no se encuentra
    END IF;

    -- Construir la consulta principal para obtener los datos detallados del cluster
    v_sql := '
        SELECT
            T1.id AS cluster_id,
            T1.profile_id,
            T1.cluster_name,
            T1.description,
            T1.start_date,
            T1.end_date,
            T1.cluster_type,
            T1.slug_cluster,
            T1.is_active,
            T1.shadowban,
            T1.legal_info_id,
            T2.name AS profile_name,
            T3.nit AS legal_info_nit,
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        ''area_id'', A.id,
                        ''area_name'', A.area_name,
                        ''description'', A.description,
                        ''capacity'', A.capacity,
                        ''price'', A.price,
                        ''currency'', A.currency,
                        ''status'', A.status,
                        ''unit_capacity'', A.unit_capacity,
                        ''service'', A.service,
                        ''nomenclature_letter'', A.nomenclature_letter,
                        ''extra_attributes'', A.extra_attributes
                    )
                ) FROM public.areas A WHERE A.cluster_id = T1.id
            ) AS areas_data,
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        ''image_id'', CI.image_id,
                        ''image_path'', IMG.path,
                        ''image_name'', IMG.name,
                        ''mime_type'', IMG.mime_type,
                        ''size'', IMG.size,
                        ''description'', IMG.description,
                        ''type_image'', CI.type_image
                    )
                ) FROM public.cluster_images CI
                   JOIN public.images IMG ON CI.image_id = IMG.id
                   WHERE CI.cluster_id = T1.id
            ) AS images_data
        FROM
            public.clusters T1
        JOIN
            public.profile T2 ON T1.profile_id = T2.id -- profile_id es UUID
        LEFT JOIN
            public.legal_info T3 ON T1.legal_info_id = T3.id -- legal_info_id es INTEGER
        WHERE
            T1.id = ' || p_cluster_id || ';'; -- Filtra por el ID recibido

    -- RAISE NOTICE 'DEBUG: SQL Query para get_cluster_details: %', v_sql; -- Descomenta para ver la consulta generada

    -- Ejecutar la consulta y devolver los resultados
    RETURN QUERY EXECUTE v_sql;

END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_clusters_list(p_limit integer DEFAULT 10, p_offset integer DEFAULT 0, p_filters jsonb DEFAULT '{}'::jsonb)
 RETURNS TABLE(cluster_id integer, profile_id uuid, cluster_name character varying, description text, start_date timestamp with time zone, end_date timestamp with time zone, cluster_type character varying, slug_cluster text, is_active boolean, shadowban boolean, legal_info_id integer, profile_name character varying, legal_info_nit character varying, areas_data jsonb, images_data jsonb, total_count integer)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_sql text;
    v_count_sql text;
    v_where_clause text := 'WHERE TRUE';
    v_filter_name text;
    v_filter_type text;
    v_filter_status text; -- Este filtro ya no se usará directamente para clusters
    v_filter_start_date_after timestamp with time zone;
    v_filter_end_date_before timestamp with time zone;
    v_total_records integer;
BEGIN
    -- Extraer filtros del JSONB (solo los que se gestionan dinámicamente)
    v_filter_name := p_filters->>'name';
    v_filter_type := p_filters->>'type';
    v_filter_status := p_filters->>'status';
    v_filter_start_date_after := (p_filters->>'start_date_after')::timestamp with time zone;
    v_filter_end_date_before := (p_filters->>'end_date_before')::timestamp with time zone;

    -- Construir la cláusula WHERE dinámicamente
    -- Filtros por defecto: cluster activo y no baneado, perfil activo y no baneado
    v_where_clause := v_where_clause || ' AND T1.is_active = TRUE';
    v_where_clause := v_where_clause || ' AND T1.shadowban = FALSE';
    v_where_clause := v_where_clause || ' AND T2.status = TRUE';
    v_where_clause := v_where_clause || ' AND T2.shadowban = FALSE';


    IF v_filter_name IS NOT NULL THEN
        v_where_clause := v_where_clause || ' AND T1.cluster_name ILIKE ' || quote_literal('%' || v_filter_name || '%');
    END IF;
    IF v_filter_type IS NOT NULL THEN
        v_where_clause := v_where_clause || ' AND T1.cluster_type = ' || quote_literal(v_filter_type);
    END IF;
    
    -- Filtros de fecha
    IF v_filter_start_date_after IS NOT NULL THEN
        v_where_clause := v_where_clause || ' AND T1.start_date >= ' || quote_literal(v_filter_start_date_after::text);
    END IF;
    IF v_filter_end_date_before IS NOT NULL THEN
        v_where_clause := v_where_clause || ' AND T1.end_date <= ' || quote_literal(v_filter_end_date_before::text);
    END IF;
    -- Puedes añadir más filtros aquí (ej. por profile_id, slug_cluster)

    -- Paso 1: Contar el total de registros que cumplen los filtros
    v_count_sql := 'SELECT COUNT(T1.id) FROM public.clusters T1 ' ||
                   'JOIN public.profile T2 ON T1.profile_id = T2.id ' || -- AÑADIDO: Union para acceder a T2
                   'LEFT JOIN public.legal_info T3 ON T1.legal_info_id = T3.id ' || -- AÑADIDO: Union para T3 si legal_info_id se usa en filtros de WHERE
                   v_where_clause;
    EXECUTE v_count_sql INTO v_total_records;

    -- Paso 2: Construir la consulta principal para obtener los datos de los clusters
    v_sql := '
        SELECT
            T1.id AS cluster_id,
            T1.profile_id,
            T1.cluster_name,
            T1.description,
            T1.start_date,
            T1.end_date,
            T1.cluster_type,
            T1.slug_cluster,
            T1.is_active,
            T1.shadowban,
            T1.legal_info_id,
            T2.name AS profile_name,
            T3.nit AS legal_info_nit,
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        ''area_id'', A.id,
                        ''area_name'', A.area_name,
                        ''description'', A.description,
                        ''capacity'', A.capacity,
                        ''price'', A.price,
                        ''currency'', A.currency,
                        ''status'', A.status,
                        ''unit_capacity'', A.unit_capacity,
                        ''service'', A.service,
                        ''nomenclature_letter'', A.nomenclature_letter,
                        ''extra_attributes'', A.extra_attributes
                    )
                ) FROM public.areas A WHERE A.cluster_id = T1.id
            ) AS areas_data,
            (
                SELECT jsonb_agg(
                    jsonb_build_object(
                        ''image_id'', CI.image_id,
                        ''image_path'', IMG.path,
                        ''image_name'', IMG.name,
                        ''mime_type'', IMG.mime_type,
                        ''size'', IMG.size,
                        ''description'', IMG.description,
                        ''type_image'', CI.type_image
                    )
                ) FROM public.cluster_images CI
                   JOIN public.images IMG ON CI.image_id = IMG.id
                   WHERE CI.cluster_id = T1.id
            ) AS images_data,
            ' || v_total_records || ' AS total_count
        FROM
            public.clusters T1
        JOIN
            public.profile T2 ON T1.profile_id = T2.id -- profile_id es UUID
        LEFT JOIN
            public.legal_info T3 ON T1.legal_info_id = T3.id -- legal_info_id es INTEGER
        ' || v_where_clause || '
        ORDER BY
            T1.created_at DESC
        LIMIT ' || p_limit || ' OFFSET ' || p_offset || ';';

    -- RAISE NOTICE 'DEBUG: SQL Query para GET: %', v_sql;

    RETURN QUERY EXECUTE v_sql;

END;
$function$
;

CREATE OR REPLACE FUNCTION public.get_database_ddl_with_rls_and_functions()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    ddl_output TEXT := '';
    r RECORD;       -- Variable principal para bucles externos (esquemas, tablas, índices, restricciones, políticas, funciones)
    r_col RECORD;   -- Nueva variable para el bucle de columnas
BEGIN
    -- DDL para esquemas
    ddl_output := ddl_output || '-- Schemas' || E'\n';
    FOR r IN
        SELECT nspname
        FROM pg_catalog.pg_namespace
        WHERE nspname NOT LIKE 'pg_%' AND nspname != 'information_schema'
        ORDER BY nspname
    LOOP
        ddl_output := ddl_output || 'CREATE SCHEMA IF NOT EXISTS ' || quote_ident(r.nspname) || ';' || E'\n';
    END LOOP;
    ddl_output := ddl_output || E'\n\n';

    -- DDL para tablas (incluyendo columnas, tipos, NULL/NOT NULL, valores por defecto)
    ddl_output := ddl_output || '-- Tables' || E'\n';
    FOR r IN
        SELECT
            c.oid,
            n.nspname AS schema_name,
            c.relname AS table_name,
            c.relrowsecurity AS has_rls_enabled -- Indica si RLS está habilitado en la tabla
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relkind = 'r' -- 'r' for regular table
          AND n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
        ORDER BY schema_name, table_name
    LOOP
        ddl_output := ddl_output || 'CREATE TABLE ' || quote_ident(r.schema_name) || '.' || quote_ident(r.table_name) || ' (' || E'\n';

        -- Columnas: ¡Aquí se usará r_col!
        FOR r_col IN
            SELECT
                a.attname AS column_name,
                format_type(a.atttypid, a.atttypmod) AS data_type,
                CASE WHEN a.attnotnull THEN ' NOT NULL' ELSE '' END AS not_null,
                pg_get_expr(ad.adbin, ad.adrelid) AS default_value
            FROM pg_catalog.pg_attribute a
            LEFT JOIN pg_catalog.pg_attrdef ad ON ad.adrelid = a.attrelid AND ad.adnum = a.attnum
            WHERE a.attrelid = r.oid
              AND a.attnum > 0
              AND NOT a.attisdropped
            ORDER BY a.attnum
        LOOP
            ddl_output := ddl_output || '    ' || quote_ident(r_col.column_name) || ' ' || r_col.data_type;
            IF r_col.default_value IS NOT NULL THEN
                ddl_output := ddl_output || ' DEFAULT ' || r_col.default_value;
            END IF;
            ddl_output := ddl_output || r_col.not_null || ',' || E'\n';
        END LOOP;

        -- Quitar la última coma para que no haya errores
        IF RIGHT(ddl_output, 2) = ',' || E'\n' THEN
            ddl_output := SUBSTRING(ddl_output, 1, LENGTH(ddl_output) - 2) || E'\n';
        END IF;

        ddl_output := ddl_output || ');' || E'\n';

        -- Habilitar RLS si está configurado en la tabla
        IF r.has_rls_enabled THEN
            ddl_output := ddl_output || 'ALTER TABLE ' || quote_ident(r.schema_name) || '.' || quote_ident(r.table_name) || ' ENABLE ROW LEVEL SECURITY;' || E'\n';
        END IF;

        ddl_output := ddl_output || E'\n';
    END LOOP;

    -- DDL para índices
    ddl_output := ddl_output || '-- Indexes' || E'\n';
    FOR r IN
        SELECT
            n.nspname AS schema_name,
            c.relname AS table_name,
            pg_get_indexdef(i.indexrelid) AS index_definition
        FROM pg_catalog.pg_class c
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        JOIN pg_catalog.pg_index i ON i.indrelid = c.oid
        WHERE c.relkind = 'r' -- Regular table
          AND i.indisprimary IS FALSE -- Excluir PKs (ya manejadas por restricciones)
          AND i.indisunique IS FALSE -- Excluir índices únicos (ya manejadas por restricciones)
          AND n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
        ORDER BY schema_name, table_name
    LOOP
        ddl_output := ddl_output || r.index_definition || ';' || E'\n';
    END LOOP;
    ddl_output := ddl_output || E'\n\n';

    -- DDL para restricciones (claves primarias, únicas, foráneas, de chequeo)
    ddl_output := ddl_output || '-- Constraints (Primary Keys, Unique, Foreign Keys, Check)' || E'\n';
    FOR r IN
        SELECT
            con.conname AS constraint_name,
            con.contype AS constraint_type,
            n.nspname AS schema_name,
            c.relname AS table_name,
            pg_get_constraintdef(con.oid) AS constraint_definition
        FROM pg_catalog.pg_constraint con
        JOIN pg_catalog.pg_class c ON con.conrelid = c.oid
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
        ORDER BY schema_name, table_name, constraint_name
    LOOP
        IF r.constraint_type IN ('p', 'u') THEN -- Primary Key or Unique
            ddl_output := ddl_output || 'ALTER TABLE ' || quote_ident(r.schema_name) || '.' || quote_ident(r.table_name) || E'\n' ||
                          '    ADD CONSTRAINT ' || quote_ident(r.constraint_name) || ' ' || r.constraint_definition || ';' || E'\n';
        ELSIF r.constraint_type = 'f' THEN -- Foreign Key
            ddl_output := ddl_output || 'ALTER TABLE ' || quote_ident(r.schema_name) || '.' || quote_ident(r.table_name) || E'\n' ||
                          '    ADD CONSTRAINT ' || quote_ident(r.constraint_name) || ' ' || r.constraint_definition || ';' || E'\n';
        ELSIF r.constraint_type = 'c' THEN -- Check Constraint
            ddl_output := ddl_output || 'ALTER TABLE ' || quote_ident(r.schema_name) || '.' || quote_ident(r.table_name) || E'\n' ||
                          '    ADD CONSTRAINT ' || quote_ident(r.constraint_name) || ' ' || r.constraint_definition || ';' || E'\n';
        END IF;
    END LOOP;
    ddl_output := ddl_output || E'\n\n';

    ---
    -- DDL para políticas de seguridad a nivel de fila (RLS)
    ---
    ddl_output := ddl_output || '-- Row-Level Security Policies' || E'\n';
    FOR r IN
        SELECT
            pol.polname AS policy_name,
            n.nspname AS schema_name,
            c.relname AS table_name,
            CASE pol.polcmd
                WHEN 'r' THEN 'FOR SELECT'
                WHEN 'a' THEN 'FOR INSERT'
                WHEN 'w' THEN 'FOR UPDATE'
                WHEN 'd' THEN 'FOR DELETE'
                WHEN '*' THEN 'FOR ALL'
            END AS command_type,
            -- ¡CORREGIDO! pol.polroles en lugar de pol.polrole
            COALESCE(array_to_string(ARRAY(SELECT pg_get_userbyid(role_oid) FROM unnest(pol.polroles) AS role_oid WHERE pg_get_userbyid(role_oid) IS NOT NULL), ', '), '') AS roles_applied_to,
            pg_get_expr(pol.polqual, pol.polrelid) AS using_expression,
            pg_get_expr(pol.polwithcheck, pol.polrelid) AS with_check_expression,
            CASE WHEN pol.polpermissive THEN 'AS PERMISSIVE' ELSE 'AS RESTRICTIVE' END AS policy_type
        FROM pg_catalog.pg_policy pol
        JOIN pg_catalog.pg_class c ON c.oid = pol.polrelid
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
        ORDER BY schema_name, table_name, policy_name
    LOOP
        ddl_output := ddl_output || 'CREATE POLICY ' || quote_ident(r.policy_name) || E'\n';
        ddl_output := ddl_output || '    ON ' || quote_ident(r.schema_name) || '.' || quote_ident(r.table_name) || E'\n';
        ddl_output := ddl_output || '    ' || r.command_type;

        IF r.roles_applied_to IS NOT NULL AND r.roles_applied_to != '' THEN
            ddl_output := ddl_output || E'\n    TO ' || r.roles_applied_to;
        END IF;

        IF r.using_expression IS NOT NULL AND r.using_expression != '' THEN
            ddl_output := ddl_output || E'\n    USING (' || r.using_expression || ')';
        END IF;

        IF r.with_check_expression IS NOT NULL AND r.with_check_expression != '' THEN
            ddl_output := ddl_output || E'\n    WITH CHECK (' || r.with_check_expression || ')';
        END IF;
        
        ddl_output := ddl_output || E';' || E'\n\n';
    END LOOP;
    ddl_output := ddl_output || E'\n\n';

    ---
    -- DDL para funciones
    ---
    ddl_output := ddl_output || '-- Functions and Procedures' || E'\n';
    FOR r IN
        SELECT
            pg_get_functiondef(p.oid) AS function_definition
        FROM pg_catalog.pg_proc p
        JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
        WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname != 'information_schema'
        AND p.prokind IN ('f', 'p', 'a', 'w') -- 'f'unction, 'p'rocedure, 'a'ggregate, 'w'indow function
        ORDER BY n.nspname, p.proname, p.oid -- Ordenar para consistencia
    LOOP
        -- pg_get_functiondef devuelve el CREATE OR REPLACE FUNCTION/PROCEDURE completo
        ddl_output := ddl_output || r.function_definition || ';' || E'\n\n';
    END LOOP;
    ddl_output := ddl_output || E'\n\n';

    -- Puedes añadir lógica similar para vistas, secuencias, etc.
    RETURN ddl_output;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.insert_images_and_relations(json_array_input jsonb)
 RETURNS boolean
 LANGUAGE plpgsql
AS $function$
DECLARE
    item jsonb;
    image_id uuid;
BEGIN
    -- Validamos que la entrada sea un JSON array
    IF NOT jsonb_typeof(json_array_input) = 'array' THEN
        RAISE EXCEPTION 'Input must be a JSON array';
    END IF;

    -- Iteramos sobre cada elemento del JSON array
    FOR item IN SELECT * FROM jsonb_array_elements(json_array_input) LOOP
        -- Validamos que el elemento tenga las claves necesarias
        IF item ? 'key' AND item ? 'Bucket' AND item ? 'mime_type' AND item ? 'reservation_unit_id' THEN
            BEGIN
                -- Insertamos en la tabla images
                INSERT INTO public.images ("name", "path", mime_type)
                VALUES (
                    'qr_code_cluster-' || (item->>'Bucket'), -- Nombre de la imagen como qr_code_cluster seguido del nombre del bucket
                    item->>'key', -- Ruta completa de la imagen (key del JSON)
                    item->>'mime_type' -- Tipo MIME de la imagen
                )
                RETURNING id INTO image_id;

                -- Insertamos en la tabla reservation_unit_qr_images
                INSERT INTO public.reservation_unit_qr_images (reservation_unit_id, image_id, type_image)
                VALUES (
                    (item->>'reservation_unit_id')::int, -- ID de la unidad de reserva
                    image_id, -- ID de la imagen recién insertada
                    'qr_code_cluster' -- Tipo de imagen
                );
            EXCEPTION
                WHEN OTHERS THEN
                    -- En caso de error en alguna inserción, retornamos false
                    RETURN false;
            END;
        ELSE
            RAISE EXCEPTION 'JSON element is missing required keys: %', item;
        END IF;
    END LOOP;

    -- Si todo sale bien, retornamos true
    RETURN true;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.manage_lead_and_campaign_association(p_campaign_id uuid, p_lead_email character varying, p_lead_source character varying DEFAULT NULL::character varying, p_profile_name character varying DEFAULT NULL::character varying, p_profile_phone_number character varying DEFAULT NULL::character varying, p_profile_nationality_id integer DEFAULT NULL::integer, p_verification_token text DEFAULT NULL::text)
 RETURNS TABLE(lead_return_id uuid, profile_return_id uuid, association_status text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_profile_id_internal UUID;
    v_lead_id_internal UUID;
    v_campaign_exists BOOLEAN;
    v_status_message TEXT;
BEGIN
    -- 0. Verificar si la campaña existe
    SELECT EXISTS (SELECT 1 FROM public.campaign WHERE id = p_campaign_id) INTO v_campaign_exists;
    IF NOT v_campaign_exists THEN
        RAISE EXCEPTION 'La campaña con ID % no existe.', p_campaign_id;
    END IF;

    -- 1. Verificar/Crear el perfil
    SELECT id INTO v_profile_id_internal
    FROM public.profile
    WHERE email = p_lead_email;

    IF v_profile_id_internal IS NULL THEN
        IF p_profile_name IS NULL OR p_profile_phone_number IS NULL OR p_profile_nationality_id IS NULL THEN
            RAISE EXCEPTION 'Para crear un nuevo perfil, los parámetros p_profile_name, p_profile_phone_number, y p_profile_nationality_id no pueden ser NULL.';
        END IF;

        INSERT INTO public.profile (name, email, phone_number, nationality_id)
        VALUES (p_profile_name, p_lead_email, p_profile_phone_number, p_profile_nationality_id)
        RETURNING id INTO v_profile_id_internal;
        v_status_message := 'profile_created';
    ELSE
        v_status_message := 'profile_existing';
    END IF;

    -- 2. Gestionar el Lead
    SELECT id INTO v_lead_id_internal
    FROM public.leads
    WHERE profile_id = v_profile_id_internal AND source = p_lead_source;

    IF v_lead_id_internal IS NULL THEN
        -- Añadir el token al crear el lead
        INSERT INTO public.leads (profile_id, source, verification_token)
        VALUES (v_profile_id_internal, p_lead_source, p_verification_token)
        RETURNING id INTO v_lead_id_internal;
        v_status_message := v_status_message || '_lead_created';
    ELSE
        v_status_message := v_status_message || '_lead_existing';
    END IF;

    -- 3. Gestionar la asociación
    IF NOT EXISTS (SELECT 1 FROM public.campaign_leads WHERE campaign_id = p_campaign_id AND lead_id = v_lead_id_internal) THEN
        INSERT INTO public.campaign_leads (campaign_id, lead_id)
        VALUES (p_campaign_id, v_lead_id_internal);
        v_status_message := v_status_message || '_association_created';
    ELSE
        v_status_message := v_status_message || '_association_existing';
    END IF;

    RETURN QUERY SELECT v_lead_id_internal, v_profile_id_internal, v_status_message::TEXT;

END;
$function$
;

CREATE OR REPLACE FUNCTION public.manage_lead_and_campaign_association(p_campaign_id uuid, p_lead_email character varying, p_lead_source character varying DEFAULT NULL::character varying, p_profile_name character varying DEFAULT NULL::character varying, p_profile_phone_number character varying DEFAULT NULL::character varying, p_profile_phone_country_code character varying DEFAULT NULL::character varying, p_profile_nationality_id integer DEFAULT NULL::integer, p_verification_token text DEFAULT NULL::text)
 RETURNS TABLE(lead_return_id uuid, profile_return_id uuid, association_status text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_profile_id_internal UUID;
    v_lead_id_internal UUID;
    v_campaign_exists BOOLEAN;
    v_status_message TEXT;
BEGIN
    -- 0. Check if the campaign exists
    SELECT EXISTS (SELECT 1 FROM public.campaign WHERE id = p_campaign_id) INTO v_campaign_exists;
    IF NOT v_campaign_exists THEN
        RAISE EXCEPTION 'The campaign with ID % does not exist.', p_campaign_id;
    END IF;

    -- 1. Check/Create the profile
    SELECT id INTO v_profile_id_internal
    FROM public.profile
    WHERE email = p_lead_email;

    IF v_profile_id_internal IS NULL THEN
        IF p_profile_name IS NULL OR p_profile_phone_number IS NULL OR p_profile_nationality_id IS NULL THEN
            RAISE EXCEPTION 'To create a new profile, the parameters p_profile_name, p_profile_phone_number, and p_profile_nationality_id cannot be NULL.';
        END IF;

        INSERT INTO public.profile (name, email, phone_number, phone_country_code, nationality_id)
        VALUES (
            p_profile_name,
            p_lead_email,
            p_profile_phone_number,
            REPLACE(p_profile_phone_country_code, '+', '')::INTEGER,
            p_profile_nationality_id
        )
        RETURNING id INTO v_profile_id_internal;
        v_status_message := 'profile_created';
    ELSE
        v_status_message := 'profile_existing';
    END IF;

    -- 2. Manage the Lead
    SELECT id INTO v_lead_id_internal
    FROM public.leads
    WHERE profile_id = v_profile_id_internal AND source = p_lead_source;

    IF v_lead_id_internal IS NULL THEN
        -- Add the token when creating the lead
        INSERT INTO public.leads (profile_id, source, verification_token)
        VALUES (v_profile_id_internal, p_lead_source, p_verification_token)
        RETURNING id INTO v_lead_id_internal;
        v_status_message := v_status_message || '_lead_created';
    ELSE
        -- If lead exists, update the verification token
        UPDATE public.leads
        SET verification_token = p_verification_token
        WHERE id = v_lead_id_internal;
        v_status_message := v_status_message || '_lead_existing_token_updated';
    END IF;

    -- 3. Manage the association
    IF NOT EXISTS (SELECT 1 FROM public.campaign_leads WHERE campaign_id = p_campaign_id AND lead_id = v_lead_id_internal) THEN
        INSERT INTO public.campaign_leads (campaign_id, lead_id)
        VALUES (p_campaign_id, v_lead_id_internal);
        v_status_message := v_status_message || '_association_created';
    ELSE
        v_status_message := v_status_message || '_association_existing';
    END IF;

    RETURN QUERY SELECT v_lead_id_internal, v_profile_id_internal, v_status_message::TEXT;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.soft_delete_cluster(p_cluster_id integer)
 RETURNS TABLE(deleted_cluster_id integer, status_message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_cluster_exists_check boolean;
    v_cluster_is_active boolean;
    v_cluster_is_shadowbanned boolean;
    v_profile_status boolean;
    v_profile_shadowban boolean;
    v_profile_id uuid; -- Para obtener el profile_id del cluster

    -- Variables para capturar detalles del error
    _sql_state text;
    _message_text text;
    _pg_exception_detail text;
    _pg_exception_hint text;
BEGIN
    RAISE NOTICE 'DEBUG: [INICIO] Funcion soft_delete_cluster iniciada para cluster_id: %', p_cluster_id;

    -- Inicializar variables de salida
    deleted_cluster_id := NULL;
    status_message := 'Operacion de soft-delete no completada.';

    BEGIN -- Bloque interno para atrapar errores
        -- PASO 1: Verificar existencia y estado actual del cluster
        RAISE NOTICE 'DEBUG: [PASO 1] Verificando existencia y estado de cluster %', p_cluster_id;
        SELECT
            T1.is_active, T1.shadowban, T2.status, T2.shadowban, T1.profile_id
        INTO
            v_cluster_is_active, v_cluster_is_shadowbanned, v_profile_status, v_profile_shadowban, v_profile_id
        FROM public.clusters T1
        JOIN public.profile T2 ON T1.profile_id = T2.id
        WHERE T1.id = p_cluster_id;

        IF NOT FOUND THEN
            deleted_cluster_id := NULL;
            status_message := 'Cluster con ID ' || p_cluster_id || ' no encontrado.';
            RAISE NOTICE 'DEBUG: [PASO 1] %', status_message;
            RETURN NEXT; -- Devuelve fila y sale
            RETURN;
        END IF;

        RAISE NOTICE 'DEBUG: [PASO 1] Cluster encontrado. is_active: %, shadowban: %, profile_status: %, profile_shadowban: %',
                     v_cluster_is_active, v_cluster_is_shadowbanned, v_profile_status, v_profile_shadowban;

        -- Si el cluster ya está inactivo/shadowbanned, no hay nada que hacer
        IF v_cluster_is_active IS FALSE AND v_cluster_is_shadowbanned IS TRUE THEN
            deleted_cluster_id := p_cluster_id;
            status_message := 'Cluster con ID ' || p_cluster_id || ' ya esta inactivo (soft-deleted).';
            RAISE NOTICE 'DEBUG: [PASO 1] %', status_message;
            RETURN NEXT;
            RETURN;
        END IF;
        
        -- Verificar si el perfil asociado al cluster está activo (esta es una verificación válida)
        IF v_profile_status IS FALSE OR v_profile_shadowban IS TRUE THEN
            RAISE EXCEPTION 'El perfil asociado al cluster con ID % no esta activo o esta baneado. No se puede desactivar el cluster.', p_cluster_id;
        END IF;


        -- PASO 2: Realizar el Soft Delete en el Cluster Principal
        RAISE NOTICE 'DEBUG: [PASO 2] Realizando soft-delete en cluster principal.';
        UPDATE public.clusters
        SET is_active = FALSE, shadowban = TRUE, updated_at = NOW()
        WHERE id = p_cluster_id;
        RAISE NOTICE 'DEBUG: [PASO 2] Cluster principal % soft-deleted.', p_cluster_id;

        -- PASO 3: Cascading Soft Deletes para Entidades Relacionadas Directamente (Areas, Units, Reservation_Units, Reservations)
        RAISE NOTICE 'DEBUG: [PASO 3] Realizando soft-delete en entidades relacionadas.';

        -- 3.1: Areas asociadas al cluster
        UPDATE public.areas
        SET status = 'inactive', updated_at = NOW() -- Asegúrate de que areas tenga 'status' y 'updated_at'
        WHERE cluster_id = p_cluster_id;
        RAISE NOTICE 'DEBUG: [PASO 3.1] Areas asociadas al cluster % soft-deleted.', p_cluster_id;

        -- 3.2: Units asociadas a las Areas del cluster
        UPDATE public.units u
        SET status = 'inactive', updated_at = NOW() -- Asegúrate de que units tenga 'status' y 'updated_at'
        FROM public.areas a
        WHERE u.area_id = a.id AND a.cluster_id = p_cluster_id;
        RAISE NOTICE 'DEBUG: [PASO 3.2] Units asociadas al cluster % soft-deleted.', p_cluster_id;

        -- 3.3: Reservation_Units asociadas a las Units de las Areas del cluster
        UPDATE public.reservation_units ru
        SET status = 'inactive', updated_at = NOW() -- Asegúrate de que reservation_units tenga 'status' y 'updated_at'
        FROM public.units u
        JOIN public.areas a ON u.area_id = a.id
        WHERE ru.unit_id = u.id AND a.cluster_id = p_cluster_id;
        RAISE NOTICE 'DEBUG: [PASO 3.3] Reservation_Units asociadas al cluster % soft-deleted.', p_cluster_id;

        -- 3.4: Reservations asociadas a las Reservation_Units del cluster
        -- Solo desactiva la reserva si TODAS sus reservation_units están inactivas.
        -- Esto evita desactivar una reserva que aún tiene unidades activas de otros clusters.
        UPDATE public.reservations r
        SET status = 'inactive', updated_at = NOW() -- Usar updated_at para el timestamp de soft delete
        WHERE r.id IN (
            SELECT ru.reservation_id
            FROM public.reservation_units ru
            JOIN public.units u ON ru.unit_id = u.id
            JOIN public.areas a ON u.area_id = a.id
            WHERE a.cluster_id = p_cluster_id
            GROUP BY ru.reservation_id
            HAVING COUNT(CASE WHEN ru.status IN ('reserved', 'approved') THEN 1 ELSE NULL END) = 0 -- Solo desactiva si NO hay unidades activas restantes para esa reserva
        );
        RAISE NOTICE 'DEBUG: [PASO 3.4] Reservations asociadas al cluster % soft-deleted si no tienen mas unidades activas.', p_cluster_id;


        -- Asignar valores de éxito
        deleted_cluster_id := p_cluster_id;
        status_message := 'Cluster soft-eliminado exitosamente.';
        RAISE NOTICE 'DEBUG: [FINAL] Funcion soft_delete_cluster completada con exito. Retornando cluster_id: %', deleted_cluster_id;

    EXCEPTION
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS
                _message_text = MESSAGE_TEXT,
                _sql_state = RETURNED_SQLSTATE,
                _pg_exception_detail = PG_EXCEPTION_DETAIL,
                _pg_exception_hint = PG_EXCEPTION_HINT;

            deleted_cluster_id := NULL;
            status_message := 'Error al soft-eliminar cluster: ' || COALESCE(_message_text, SQLERRM);
            RAISE NOTICE 'DEBUG: [ERROR CAPTURADO] SQLSTATE=% MSG=%', _sql_state, _message_text;
            IF _pg_exception_detail IS NOT NULL THEN
                RAISE NOTICE 'DEBUG: DETALLE: %', _pg_exception_detail;
            END IF;
            IF _pg_exception_hint IS NOT NULL THEN
                RAISE NOTICE 'DEBUG: SUGERENCIA: %', _pg_exception_hint;
            END IF;
    END; -- Fin del bloque BEGIN/EXCEPTION interno

    RETURN NEXT;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.test_product_drop_status_column_visibility()
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
    temp_status VARCHAR(50);
BEGIN
    -- Intenta seleccionar el status de cualquier fila en product_drop
    SELECT status INTO temp_status FROM public.product_drop LIMIT 1;
    RETURN 'Column "status" is visible and has value: ' || COALESCE(temp_status, 'NULL');
EXCEPTION
    WHEN undefined_column THEN
        RETURN 'ERROR: Column "status" is NOT visible to this function.';
    WHEN OTHERS THEN
        RETURN 'ANOTHER ERROR: ' || SQLSTATE || ' - ' || SQLERRM;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_cluster_data(p_cluster_id integer, p_updates jsonb)
 RETURNS TABLE(updated_cluster_id integer, status_message text)
 LANGUAGE plpgsql
AS $function$
DECLARE
    k TEXT;                                -- Variable para la clave (nombre de la columna)
    v JSONB;                               -- Variable para el valor (valor de la columna)
    set_parts TEXT[] := '{}';              -- Array para construir las partes del SET
    v_set_clause TEXT;                     -- Variable AÑADIDA para la cláusula SET completa
    update_sql TEXT;                       -- Variable para SQL dinámico
    v_legal_info_id_val INTEGER;           -- Variable AÑADIDA para legal_info_id
    v_sql TEXT;                            -- Variable AÑADIDA para SQL dinámico
    
    -- Variables para capturar detalles del error
    _sql_state text;
    _message_text text;
    _pg_exception_detail text;
    _pg_exception_hint text;
    
    -- Variables para validación
    v_current_legal_info_id integer;
    v_cluster_start_date timestamp with time zone;
    _dummy_id integer;
BEGIN
    RAISE NOTICE 'DEBUG: [INICIO] Funcion update_cluster_data iniciada.';
    RAISE NOTICE 'DEBUG: [PARAM] p_cluster_id = %', p_cluster_id;
    RAISE NOTICE 'DEBUG: [PARAM] p_updates (JSONB recibido) = %', p_updates;

    -- Inicializar variables de salida
    updated_cluster_id := NULL;
    status_message := 'Operacion de actualizacion no completada.';

    -- Bloque BEGIN/EXCEPTION interno
    BEGIN
        RAISE NOTICE 'DEBUG: [CHECK] Verificando existencia y visibilidad del cluster %. ', p_cluster_id;
        SELECT T1.id, T1.legal_info_id, T1.start_date 
        INTO _dummy_id, v_current_legal_info_id, v_cluster_start_date
        FROM public.clusters T1
        JOIN public.profile T2 ON T1.profile_id = T2.id
        WHERE T1.id = p_cluster_id
          AND T1.is_active = TRUE
          AND T1.shadowban = FALSE
          AND T2.status = TRUE
          AND T2.shadowban = FALSE;

        IF NOT FOUND THEN
            updated_cluster_id := NULL;
            status_message := 'Cluster con ID ' || p_cluster_id || ' no encontrado o no activo/visible para actualizar.';
            RAISE NOTICE 'DEBUG: %', status_message;
            RETURN NEXT;
        END IF;

        RAISE NOTICE 'DEBUG: Cluster % encontrado y visible. Start_date: %', p_cluster_id, v_cluster_start_date;

        -- Validación de fecha
        IF v_cluster_start_date IS NOT NULL AND v_cluster_start_date <= NOW() + INTERVAL '7 days' THEN
            RAISE EXCEPTION 'No se pueden realizar modificaciones. El evento (%) - ID: % inicia en menos de una semana.', 
                            v_cluster_start_date, p_cluster_id;
        END IF;

        -- Construir cláusula SET dinámicamente
        FOR k, v IN SELECT * FROM jsonb_each(p_updates) LOOP
            CONTINUE WHEN k IN ('legal_info_data', 'areas_data', 'images_data', 'profile_id', 'id', 'created_at');

            CASE jsonb_typeof(v)
                WHEN 'string' THEN
                    set_parts := array_append(set_parts, format('%I = %L', k, v->>0));
                WHEN 'number' THEN
                    set_parts := array_append(set_parts, format('%I = %s', k, v->>0));
                WHEN 'boolean' THEN
                    set_parts := array_append(set_parts, format('%I = %s', k, v->>0));
                WHEN 'null' THEN
                    set_parts := array_append(set_parts, format('%I = NULL', k));
                ELSE
                    set_parts := array_append(set_parts, format('%I = %L::jsonb', k, v));
            END CASE;
        END LOOP;
        
        -- Añadir updated_at
        IF array_length(set_parts, 1) IS NULL THEN
            v_set_clause := 'updated_at = NOW()';
        ELSE
            v_set_clause := array_to_string(set_parts, ', ') || ', updated_at = NOW()';
        END IF;

        -- Ejecutar UPDATE si hay campos válidos
        IF v_set_clause IS NOT NULL AND v_set_clause != '' AND v_set_clause != 'updated_at = NOW()' THEN
            update_sql := format('UPDATE public.clusters SET %s WHERE id = %s', v_set_clause, p_cluster_id);
            RAISE NOTICE 'DEBUG: [DML] Ejecutando: %', update_sql;
            EXECUTE update_sql;
        ELSE
            RAISE NOTICE 'DEBUG: [INFO] No se realizaron cambios en el cluster principal';
        END IF;

        -- Procesar legal_info_data
        IF jsonb_exists(p_updates, 'legal_info_data') THEN
            RAISE NOTICE 'DEBUG: [PROCESO] Procesando legal_info_data';
            IF p_updates->'legal_info_data' IS NOT NULL THEN
                IF v_current_legal_info_id IS NOT NULL THEN
                    v_sql := format('
                        UPDATE public.legal_info SET
                            nit = COALESCE(%L, nit),
                            legal_name = COALESCE(%L, legal_name),
                            puleb_code = COALESCE(%L, puleb_code),
                            address = COALESCE(%L, address),
                            city = COALESCE(%L, city),
                            country = COALESCE(%L, country)
                        WHERE id = %s',
                        p_updates->'legal_info_data'->>'nit',
                        p_updates->'legal_info_data'->>'legal_name',
                        p_updates->'legal_info_data'->>'puleb_code',
                        p_updates->'legal_info_data'->>'address',
                        p_updates->'legal_info_data'->>'city',
                        p_updates->'legal_info_data'->>'country',
                        v_current_legal_info_id);
                    RAISE NOTICE 'DEBUG: [DML] Ejecutando: %', v_sql;
                    EXECUTE v_sql;
                ELSE
                    INSERT INTO public.legal_info (
                        nit, legal_name, puleb_code, address, city, country
                    ) VALUES (
                        p_updates->'legal_info_data'->>'nit',
                        p_updates->'legal_info_data'->>'legal_name',
                        p_updates->'legal_info_data'->>'puleb_code',
                        p_updates->'legal_info_data'->>'address',
                        p_updates->'legal_info_data'->>'city',
                        p_updates->'legal_info_data'->>'country'
                    ) RETURNING id INTO v_legal_info_id_val;

                    UPDATE public.clusters SET legal_info_id = v_legal_info_id_val WHERE id = p_cluster_id;
                    RAISE NOTICE 'DEBUG: [DML] Nueva legal_info insertada (ID: %)', v_legal_info_id_val;
                END IF;
            ELSE
                UPDATE public.clusters SET legal_info_id = NULL WHERE id = p_cluster_id;
                RAISE NOTICE 'DEBUG: [DML] legal_info desvinculada';
            END IF;
        END IF;

        -- Resultado exitoso
        updated_cluster_id := p_cluster_id;
        status_message := 'Cluster actualizado exitosamente.';
        RAISE NOTICE 'DEBUG: [FINAL] Operación completada para cluster_id: %', updated_cluster_id;

    EXCEPTION
        WHEN OTHERS THEN
            GET STACKED DIAGNOSTICS
                _message_text = MESSAGE_TEXT,
                _sql_state = RETURNED_SQLSTATE,
                _pg_exception_detail = PG_EXCEPTION_DETAIL,
                _pg_exception_hint = PG_EXCEPTION_HINT;

            updated_cluster_id := NULL;
            status_message := 'Error actualizando cluster: ' || _message_text;
            RAISE NOTICE 'DEBUG: [ERROR] Estado SQL: %, Mensaje: %', _sql_state, _message_text;
    END;

    RETURN NEXT;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_payment_and_reservation_status(p_reservation_id uuid, p_status character varying, p_payment_date timestamp with time zone, p_payment_method character varying, p_amount numeric, p_currency character varying)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    result JSONB;
BEGIN
    -- Intentar actualizar el pago existente
    UPDATE public.payments 
    SET 
        status = p_status,
        payment_date = p_payment_date,
        payment_method = p_payment_method,
        amount = p_amount,
        currency = p_currency
    WHERE reservation_id = p_reservation_id
    RETURNING jsonb_build_object(
        'id', id,
        'status', status,
        'amount', amount,
        'currency', currency
    ) INTO result;
    
    -- Si no se actualizó ninguna fila, insertar un nuevo registro
    IF result IS NULL THEN
        INSERT INTO public.payments (
            reservation_id,
            status,
            payment_date,
            payment_method,
            amount,
            currency
        ) 
        VALUES (
            p_reservation_id,
            p_status,
            p_payment_date,
            p_payment_method,
            p_amount,
            p_currency
        )
        RETURNING jsonb_build_object(
            'id', id,
            'status', status,
            'amount', amount,
            'currency', currency
        ) INTO result;
    END IF;

    -- Si el estado es 'approved', actualizar también las reservation_units
    IF p_status = 'approved' THEN
        UPDATE public.reservation_units
        SET status = 'approved'
        WHERE reservation_id = p_reservation_id;
    END IF;

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_reservation_status()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
BEGIN
    -- Cambiar estado a 'incomplete' si han pasado 20 minutos y el estado es 'reserved'
    UPDATE public.reservation_units
    SET status = 'incomplete'
    WHERE updated_at <= NOW() - INTERVAL '8 minutes'
    AND status = 'reserved';

    -- No es necesario agregar más condiciones ya que el primer UPDATE ya cubre ambos criterios
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_wompi_payment_status(p_wompi_data jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
AS $function$
DECLARE
    v_transaction JSONB;
    v_reservation_id UUID;
    result JSONB;
BEGIN
    -- Extraer la transacción del JSON de Wompi
    v_transaction := p_wompi_data->'data'->'transaction';
    
    -- Obtener reservation_id desde el campo reference
    v_reservation_id := (v_transaction->>'reference')::uuid;

    -- Verificar que la reserva existe
    IF NOT EXISTS (SELECT 1 FROM public.reservations WHERE id = v_reservation_id) THEN
        RAISE EXCEPTION 'Reservation with id % does not exist', v_reservation_id;
    END IF;

    -- Actualizar payment existente
    UPDATE public.payments 
    SET 
        status = v_transaction->>'status',
        payment_date = COALESCE((v_transaction->>'created_at')::timestamptz, CURRENT_TIMESTAMP),
        amount = (v_transaction->>'amount_in_cents')::numeric / 100,
        currency = COALESCE(v_transaction->>'currency', 'USD'),
        payment_method = v_transaction->'payment_method'->>'type',
        payment_gateway_transaction_id = v_transaction->>'id',  -- ID de Wompi
        amount_in_cents = (v_transaction->>'amount_in_cents')::bigint,
        payment_method_type = v_transaction->>'payment_method_type',
        payment_method_data = v_transaction->'payment_method',
        customer_email = v_transaction->>'customer_email',
        customer_data = v_transaction->'customer_data',
        billing_data = v_transaction->'billing_data',
        finalized_at = (v_transaction->>'finalized_at')::timestamptz,
        status_message = v_transaction->>'status_message',
        reference = v_transaction->>'reference',
        environment = p_wompi_data->>'environment',
        updated_at = CURRENT_TIMESTAMP
    WHERE reservation_id = v_reservation_id
    RETURNING jsonb_build_object(
        'id', id,
        'status', status,
        'amount', amount,
        'currency', currency,
        'payment_gateway_transaction_id', payment_gateway_transaction_id,
        'payment_method', payment_method,
        'customer_email', customer_email
    ) INTO result;
    
    -- Si no existe el payment, crear uno nuevo
    IF result IS NULL THEN
        INSERT INTO public.payments (
            reservation_id,
            status,
            payment_date,
            amount,
            currency,
            payment_method,
            payment_gateway_transaction_id,
            amount_in_cents,
            payment_method_type,
            payment_method_data,
            customer_email,
            customer_data,
            billing_data,
            finalized_at,
            status_message,
            reference,
            environment,
            updated_at
        ) 
        VALUES (
            v_reservation_id,
            v_transaction->>'status',
            COALESCE((v_transaction->>'created_at')::timestamptz, CURRENT_TIMESTAMP),
            (v_transaction->>'amount_in_cents')::numeric / 100,
            COALESCE(v_transaction->>'currency', 'USD'),
            v_transaction->'payment_method'->>'type',
            v_transaction->>'id',
            (v_transaction->>'amount_in_cents')::bigint,
            v_transaction->>'payment_method_type',
            v_transaction->'payment_method',
            v_transaction->>'customer_email',
            v_transaction->'customer_data',
            v_transaction->'billing_data',
            (v_transaction->>'finalized_at')::timestamptz,
            v_transaction->>'status_message',
            v_transaction->>'reference',
            p_wompi_data->>'environment',
            CURRENT_TIMESTAMP
        )
        RETURNING jsonb_build_object(
            'id', id,
            'status', status,
            'amount', amount,
            'currency', currency,
            'payment_gateway_transaction_id', payment_gateway_transaction_id,
            'payment_method', payment_method,
            'customer_email', customer_email
        ) INTO result;
    END IF;

    -- Actualizar el estado de las reservation_units
    UPDATE public.reservation_units
    SET status = CASE 
        WHEN v_transaction->>'status' = 'APPROVED' THEN 'approved'
        WHEN v_transaction->>'status' = 'DECLINED' THEN 'declined'
        WHEN v_transaction->>'status' = 'ERROR' THEN 'error'
        ELSE 'reserved'
    END,
    updated_at = CURRENT_TIMESTAMP
    WHERE reservation_id = v_reservation_id;

    RETURN result;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v1()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v1mc()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v1mc$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v3(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v3$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v4()
 RETURNS uuid
 LANGUAGE c
 PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v4$function$
;

CREATE OR REPLACE FUNCTION public.uuid_generate_v5(namespace uuid, name text)
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_generate_v5$function$
;

CREATE OR REPLACE FUNCTION public.uuid_nil()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_nil$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_dns()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_dns$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_oid()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_oid$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_url()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_url$function$
;

CREATE OR REPLACE FUNCTION public.uuid_ns_x500()
 RETURNS uuid
 LANGUAGE c
 IMMUTABLE PARALLEL SAFE STRICT
AS '$libdir/uuid-ossp', $function$uuid_ns_x500$function$
;




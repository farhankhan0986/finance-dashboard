-- Function for Dashboard Summary (Income, Expenses, Net)
CREATE OR REPLACE FUNCTION get_dashboard_summary(p_user_id UUID, p_role TEXT)
RETURNS TABLE (total_income numeric, total_expenses numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expenses
  FROM public.records
  WHERE p_role IN ('admin', 'analyst') OR created_by = p_user_id;
END;
$$;

-- Function for Dashboard Trends (Monthly breakdown)
CREATE OR REPLACE FUNCTION get_dashboard_trends(p_user_id UUID, p_role TEXT)
RETURNS TABLE (month text, income numeric, expense numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TO_CHAR(DATE_TRUNC('month', record_date), 'YYYY-MM') as month,
    COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as income,
    COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as expense
  FROM public.records
  WHERE p_role IN ('admin', 'analyst') OR created_by = p_user_id
  GROUP BY DATE_TRUNC('month', record_date)
  ORDER BY DATE_TRUNC('month', record_date) DESC
  LIMIT 12;
END;
$$;

-- Function for Category Totals
CREATE OR REPLACE FUNCTION get_category_totals(p_user_id UUID, p_role TEXT)
RETURNS TABLE (category text, type text, total numeric)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.category::text, 
    r.type::text, 
    COALESCE(SUM(amount), 0) as total
  FROM public.records r
  WHERE p_role IN ('admin', 'analyst') OR r.created_by = p_user_id
  GROUP BY r.category, r.type
  ORDER BY total DESC;
END;
$$;

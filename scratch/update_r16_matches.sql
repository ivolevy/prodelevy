-- Actualizar partidos de 16avos de final con equipos confirmados (Mundial 2026)
UPDATE matches SET away_team_id = 'PAR' WHERE id = 75;  -- GER vs PAR
UPDATE matches SET away_team_id = 'NOR' WHERE id = 77;  -- CIV vs NOR
UPDATE matches SET home_team_id = 'FRA', away_team_id = 'SWE' WHERE id = 78;  -- FRA vs SWE
UPDATE matches SET away_team_id = 'ECU' WHERE id = 79;  -- MEX vs ECU
UPDATE matches SET home_team_id = 'ENG', away_team_id = 'COD' WHERE id = 80;  -- ENG vs COD
UPDATE matches SET home_team_id = 'BEL', away_team_id = 'SEN' WHERE id = 81;  -- BEL vs SEN
UPDATE matches SET home_team_id = 'ESP', away_team_id = 'AUT' WHERE id = 83;  -- ESP vs AUT
UPDATE matches SET home_team_id = 'POR', away_team_id = 'CRO' WHERE id = 84;  -- POR vs CRO
UPDATE matches SET away_team_id = 'ALG' WHERE id = 85;  -- SUI vs ALG
UPDATE matches SET away_team_id = 'EGY' WHERE id = 86;  -- AUS vs EGY
UPDATE matches SET away_team_id = 'CPV' WHERE id = 87;  -- ARG vs CPV
UPDATE matches SET home_team_id = 'COL', away_team_id = 'GHA' WHERE id = 88;  -- COL vs GHA

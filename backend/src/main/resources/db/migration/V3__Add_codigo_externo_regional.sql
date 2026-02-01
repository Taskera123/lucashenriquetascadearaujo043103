ALTER TABLE regional
ADD COLUMN codigo_externo INTEGER;

CREATE INDEX idxRegionalCodigoExterno ON regional (codigo_externo);

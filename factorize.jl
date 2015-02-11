import NMF

k = 3
t = 1.0e-4

println("Loading ",ARGS[1])
data = readcsv(ARGS[1]);

beer_ids = sort([n for n in Set(data[:,1])])
user_ids = sort([n for n in Set(data[:,2])])

println("Uniques beers: ",length(beer_ids))
println("Uniques uesrs: ",length(user_ids))

println("Building matrix...")

M = zeros(length(beer_ids),length(user_ids))
for i=1:size(data,1)
    beer_idx = findin(beer_ids, data[i,1])[1]
    user_idx = findin(user_ids, data[i,2])[1]
    M[beer_idx,user_idx] = convert(Float64,data[i,3]/5.0)
end

m = 2

println("Factorizing matrix (k=$k, m=$m, t=$t)")
result = NMF.nnmf(M, k, alg=:multmse, maxiter=m, tol=t)
while (!result.converged)
    m *= 2;
    println("Factorizing matrix (k=$k, m=$m, t=$t)")
    result = NMF.nnmf(M, k, alg=:multmse, maxiter=m, tol=t)
end

println("Matrix factorized!")